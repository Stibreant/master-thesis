import json
import requests
import pandas as pd
from sqlalchemy import Engine, create_engine
import polyline
from Location import Stop

def find_specific_journey(engine: Engine, line):
    # with engine.connect() as conn:
    #     # rows = conn.execute(text(f'SELECT * FROM Vehicles WHERE "MonitoredVehicleJourney.LineRef"={line} AND "MonitoredVehicleJourney.MonitoredCall.StopPointRef" = "{first_stop}"')).fetchall()
    #     rows = conn.execute(text(f'SELECT * FROM Vehicles WHERE "MonitoredVehicleJourney.LineRef"={line} AND "MonitoredVehicleJourney.MonitoredCall.StopPointRef" = "{first_stop}"')).fetchall()
    #     # Get row with latest timestamp
    #     latest = max(rows, key=lambda x: x[1])

    # TODO: Check if we can improve preformance getting the last date and then selecting the specific journey. This may involve some indexing
    data = pd.read_sql_query(f'SELECT * FROM Vehicles WHERE "MonitoredVehicleJourney.LineRef"={line}', engine)
    hasStart = data[data["MonitoredVehicleJourney.OriginRef"] == data["MonitoredVehicleJourney.MonitoredCall.StopPointRef"]].drop_duplicates(subset="MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef", keep="first")
    # select the specific journey that is at it's destination stop
    hasDestination = data[data["MonitoredVehicleJourney.DestinationRef"] == data["MonitoredVehicleJourney.MonitoredCall.StopPointRef"]].drop_duplicates(subset="MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef", keep="first")

    busesWithStart = dict()
    for _, row in hasStart.iterrows():
        busesWithStart[row["MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef"]] = True

    mask = hasDestination["MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef"].isin(busesWithStart.keys())
    hasBoth = hasDestination[mask]

    latestRidep = hasBoth[hasBoth["RecordedAtTime"] == hasBoth["RecordedAtTime"].max()]
    return latestRidep


def get_polyline_from_id(service_id):
    url = f"https://api.kolumbus.no/api/journeys/{service_id}/polyline"
    response = requests.get(url)
    ResponsePolyline = response.json()
    coordinates = ResponsePolyline["coordinates"]
    coordinates = [(x[1], x[0]) for x in coordinates]
    pline = polyline.encode(coordinates=coordinates)
    return pline

def generate_platform_table(engine: Engine):
    url = "https://api.kolumbus.no/api/platforms"
    platforms = pd.DataFrame(requests.get(url).json())

    
    # Upsert table
    # TODO: check if we actually upsert still
    with engine.connect() as conn:
            
        trans = conn.begin()
        try:
            platforms.to_sql('Platforms', conn, if_exists='append', index=False)
            trans.commit()
        except Exception as e:
            print("FATAL")
            print(e)
            trans.rollback()


def get_platforms_info(engine: Engine, locations: pd.DataFrame):
    # with engine.connect() as conn:
    #     # print(conn.execute(text("PRAGMA table_info(Platforms);")).fetchall())
    #     platform = pd.read_sql_query(f'SELECT * FROM Platforms WHERE nsr_id="{platform_id}"', engine)
    #     # platform = conn.execute(text(f'SELECT * FROM Platforms WHERE nsr_id="{platform_id}"')).one()
    #     ## Fetch platforms if this happens
    # return platform

    for _, location in locations.iterrows():
        yield pd.read_sql_query(f'SELECT * FROM Platforms WHERE nsr_id="{location["MonitoredVehicleJourney.MonitoredCall.StopPointRef"]}"', engine)

def get_all_locations(engine: Engine, service_id):
    locations = pd.read_sql(f'''SELECT *
                        FROM Vehicles
                        WHERE "MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef" = "{service_id}"
                      ''', engine)
    # with engine.connect() as conn:
    #     locations = conn.execute(text(f'''SELECT *
    #                         FROM Vehicles
    #                         WHERE "MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef" = "{service_id}"
    #                       ''')).fetchall()
    return locations

        # z = conn.execute(text(f'''SELECT "MonitoredVehicleJourney.MonitoredCall.StopPointRef", "RecordedAtTime", "MonitoredVehicleJourney.LineRef", "MonitoredVehicleJourney.VehicleRef" 
        #                     FROM Vehicles 
        #                     WHERE "RecordedAtTime" >= "{timestamp}" AND RecordedAtTime < "{endtimestamp}" AND "MonitoredVehicleJourney.LineRef"= {line} AND "MonitoredVehicleJourney.VehicleRef" = {vehicle}
        #                     ''')).fetchall()

def get_all_stops(locations: pd.DataFrame):

    # Except if locations is not sored  by timestamp
    # for i, _ in enumerate(locations):
    #     if i == len(locations) - 1:
    #         break

    #     if locations[i][1] > locations[i+1][1]:
    #         raise ValueError("Locations are not sorted by timestamp")
        
    # stopRefs = []
    # for index, location in locations.iterrows():
    #     if len(stopRefs) == 0:
    #         stopRefs.append(location["MonitoredVehicleJourney.MonitoredCall.StopPointRef"])
    #     elif location["MonitoredVehicleJourney.MonitoredCall.StopPointRef"] != stopRefs[-1]:
    #         stopRefs.append(location["MonitoredVehicleJourney.MonitoredCall.StopPointRef"])

    stopRefs = locations.drop_duplicates(subset="MonitoredVehicleJourney.MonitoredCall.StopPointRef", keep="first")

    
    # stops = []
    # for stopRef in stopRefs:
    #     stops.append(get_platform(engine, stopRef))
    # return pd.DataFrame(stops)
    
    # return pd.DataFrame(get_platform(engine, stopRef) for stopRef in stopRefs)
    return pd.DataFrame(pd.concat(get_platforms_info(engine, stopRefs)))

PROBLEMATIC_STOPS_LIST = [
    # Botanical garden and industrial area
    ("NSR:Quay:108746", "NSR:Quay:47931"), 
    ("NSR:Quay:47929", "NSR:Quay:108747"),
    # Lagårdsveien
    ("NSR:Quay:46257", "NSR:Quay:48107"),
    ("NSR:Quay:48762", "NSR:Quay:48106")
]

PROBLEMATIC_STOPS = dict()

for start, end in PROBLEMATIC_STOPS_LIST:
    PROBLEMATIC_STOPS[start] = end
    PROBLEMATIC_STOPS[end] = start


def split_stops(stops: pd.DataFrame) -> list[pd.DataFrame]:
    legs = []
    leg = pd.DataFrame(columns=stops.columns)
    end_problematic_route = ""
    # TODO This is a bit of a mess, but it works. It should be refactored and optimized
    for index, stop in stops.iterrows():
        stop = pd.DataFrame(stop).T
        # End of a problematic portion of the route, add the stop and continue as normal
        if stop["nsr_id"][0] == end_problematic_route:
            leg = pd.concat([leg, stop], ignore_index=True)
            end_problematic_route = ""
            continue
        
        # We do not add the stop if we are in a problematic portion
        if end_problematic_route != "":
            continue

        # Start of a problematic portion of the route
        if stop["nsr_id"][0] in PROBLEMATIC_STOPS:
            end_problematic_route = PROBLEMATIC_STOPS[stop["nsr_id"][0]]
            leg = pd.concat([leg, stop], ignore_index=True)
            legs.append(leg)
            leg = pd.DataFrame(columns=stops.columns)
        # Normal portion, add the stop
        else:
            leg = pd.concat([leg, stop], ignore_index=True)
    
    if len(leg) > 0:
        legs.append(leg)

    return legs

def get_route(origin, destination, waypoints):
    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    originStop = Stop(origin[0], origin[1])
    destinationStop = Stop(destination[0], destination[1])
    waypointsStop = [Stop(x[0], x[1]) for x in waypoints]

    print(json.dumps(originStop, default=lambda o: o.__dict__))
    response = requests.post(url, json={
        "origin": originStop,
        # "origin":{
        #     "location":{
        #         "latLng":{
        #             "latitude": origin[0],
        #             "longitude": origin[1]
        #         }
        #     }
        # },
        "destination": destinationStop,
        "intermediates": waypointsStop,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "computeAlternativeRoutes": False,
        "languageCode": "en-US",
        "units": "METRIC"
    }, headers={
        "X-Goog-Api-Key": "AIzaSyB0czyQWhF7JIinN_XcFsDCARz4ladcd5k",
        "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline"
    })

    return response.json()

if __name__ == "__main__": 
    engine = create_engine('sqlite:///test.db', echo=False)
    firstStop = "NSR:Quay:46963"
    # line = 1033
    line = 1007
    # vehicle = 2247
    # timestamp = '2024-02-02T17:27:16+01:00'
    # endtimestamp = '2024-02-02T19:27:16+01:00'
    specific_journey = find_specific_journey(engine, line)

    # specific journey id
    # print(specific_journey[5])
    # print(get_polyline_from_id(specific_journey[5]))

    
    locations = get_all_locations(engine, specific_journey["MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef"].values[0])

    stops = get_all_stops(locations)
    # stops = pd.DataFrame(stops)
    # print(stops)

    # encode polyline from lat, long
    # print(polyline.encode(stops[["latitude", "longitude"]].values.tolist()))
    # print(polyline.encode([(x['latitude'], x['longitude']) for x in stops]))
    # print(stops["name"].tolist())
    
    legs = split_stops(stops)

    # Call google maps to get a route for each leg
    for leg in legs:
        coords = []
        for index, stop in leg.iterrows():
            if index == 0 or index == len(leg) - 1:
                continue
            coords.append((stop["latitude"], stop["longitude"]))
        origin = [leg.iloc[0]["latitude"], leg.iloc[0]["longitude"]]
        destination = [leg.iloc[-1]["latitude"], leg.iloc[-1]["longitude"]]
        print(get_route(origin, destination, coords))
    


# Line 6
# firstStop = "NSR:Quay:46963"
# line = 1007
# vehicle = 2247
# timestamp = '2024-02-02T17:27:16+01:00'
# endtimestamp = '2024-02-02T19:27:16+01:00'