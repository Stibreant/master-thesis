from datetime import datetime, timezone, timedelta
import json
from sched import scheduler
import sched
import time
import requests
import pandas as pd
from sqlalchemy import Engine, create_engine
import polyline
from Location import Stop
from sqlalchemy import text


timezone_offset = 1  # European Standard Time (UTC+01:00)
tzinfo = timezone(timedelta(hours=timezone_offset))

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
    if latestRidep.empty:
        return None, None
    # Find latest ride where destination is different from latestRidep
    if latestRidep.empty:
        return None, None
    other = hasBoth[hasBoth["MonitoredVehicleJourney.DestinationRef"] != latestRidep["MonitoredVehicleJourney.DestinationRef"].values[0]]
    if other.empty:
        return latestRidep, None
    latestOther = other[other["RecordedAtTime"] == other["RecordedAtTime"].max()]
    return latestRidep, latestOther


def get_polyline_from_id(service_id):
    print(service_id)
    service_id = "KOL:ServiceJourney:1012_231113103212494_2045"
    url = f"https://api.kolumbus.no/api/journeys/{service_id}/polyline"
    response = requests.get(url)
    ResponsePolyline = response.json()
    coordinates = ResponsePolyline["coordinates"]
    coordinates = [(x[1], x[0]) for x in coordinates]
    pline = polyline.encode(coordinates=coordinates)
    return pline

def generate_platform_table(engine: Engine):
    url = "https://api.kolumbus.no/api/platforms"
    platforms = pd.DataFrame(requests.get(url, verify=False).json())

    
    # Upsert table
    # TODO: check if we actually upsert still
    with engine.connect() as conn:
            
        trans = conn.begin()
        try:
            platforms.to_sql('Platforms', conn, if_exists='replace', index=False)
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

def get_all_stops(engine: Engine, locations: pd.DataFrame):

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
    ("NSR:Quay:48762", "NSR:Quay:48106"),
    # 42
    ("NSR:Quay:48780", "NSR:Quay:48106"),
    ("NSR:Quay:48781", "NSR:Quay:48107"),
    # Sentrum / Vaktapoteket
    # ("NSR:Quay:46973", "NSR:Quay:46957")
    # 3
    # 4
    ("NSR:Quay:45283", "NSR:Quay:44997")
]

PROBLEMATIC_STOPS = dict()

for start, end in PROBLEMATIC_STOPS_LIST:
    if start in PROBLEMATIC_STOPS:
        PROBLEMATIC_STOPS[start].append(end)
    else:
        PROBLEMATIC_STOPS[start] = [end]

    if end in PROBLEMATIC_STOPS:
        PROBLEMATIC_STOPS[end].append(start)
    else:
        PROBLEMATIC_STOPS[end] = [start]


def split_stops(stops: pd.DataFrame) -> list[pd.DataFrame]:
    legs = []
    leg = pd.DataFrame(columns=stops.columns)
    end_problematic_route = []
    # TODO This is a bit of a mess, but it works. It should be refactored and optimized
    for index, stop in stops.iterrows():
        stop = pd.DataFrame(stop).T
        # End of a problematic portion of the route, add the stop and continue as normal
        if stop["nsr_id"][0] in end_problematic_route:
            leg = pd.concat([leg, stop], ignore_index=True)
            end_problematic_route = []
            continue
        
        # We do not add the stop if we are in a problematic portion
        if end_problematic_route != []:
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

    for stop in waypointsStop:
        stop["via"] = True
        stop["sideOfRoad"] = False
    
    dataJson = {
        "origin": originStop,
        "destination": destinationStop,
        "intermediates": waypointsStop,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "computeAlternativeRoutes": False,
        "languageCode": "en-US",
        "units": "METRIC"
    }
    print(dataJson)

    response = requests.post(url, json=dataJson, 
        headers={
        "X-Goog-Api-Key": "AIzaSyB0czyQWhF7JIinN_XcFsDCARz4ladcd5k",
        "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline"
    })
    print(response)
    if response.status_code != 200:
        print("Failed to get route")
        print(response.text)
        return None

    return response.json()

# Remove every other stop till there are 25 stops left
def remove_every_other_stop(stops: pd.DataFrame):
    if len(stops) <= 25:
        return stops
    
    new_stops = stops.copy(deep=True)
    first_index = new_stops.index[0]
    for i in range(1, len(stops), 2):
        if len(new_stops) == 25:
            break
        new_stops = new_stops.drop(first_index + i)
        print(len(new_stops))
    return new_stops

def call_google_api(legs: list[pd.DataFrame]):
    responses = []
    # Call google maps to get a route for each leg
    for leg in legs:
        if len(leg) < 2:
            continue
        coords = []
        for index, stop in leg.iterrows():
            if index == 0 or index == len(leg) - 1:
                continue
            coords.append((stop["latitude"], stop["longitude"]))
            print("Waypoint ", stop["name"])
        origin = [leg.iloc[0]["latitude"], leg.iloc[0]["longitude"]]
        destination = [leg.iloc[-1]["latitude"], leg.iloc[-1]["longitude"]]
        print("Origin ", leg.iloc[0]["name"])
        print("Destination ",leg.iloc[-1]["name"])
        responses.append(get_route(origin, destination, coords))
        # print(leg["nsr_id"])
    return responses

def save_responses_to_db(engine: Engine, responses , specific_journey: pd.DataFrame):
    # Save response to db
    with engine.connect() as conn:
        trans = conn.begin()
        date = datetime.now(tzinfo)
        destination = specific_journey["MonitoredVehicleJourney.DestinationRef"].values[0]
        # try:
        for i, response in enumerate(responses):
            # Create DataFrame from response and legs
            try:
                list_of_data = [response["routes"][0]["duration"], response["routes"][0]["staticDuration"], response["routes"][0]["distanceMeters"], response["routes"][0]["polyline"]["encodedPolyline"], date, specific_journey["MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef"].values[0], f"{i+1}/{len(responses)}", destination]
                df = pd.DataFrame([list_of_data], columns=["duration", "staticDuration", "distanceMeters", "polyline", "date", "service_id", "route_number", "destination"])
                df.to_sql('Routes', conn, if_exists='append', index=False)
            except:
                pass
        trans.commit()
        # except Exception as e:
        #     print("FATAL")
        #     print(e)
        #     trans.rollback()

def main_traffic(engine: Engine, scheduler: scheduler ,lines_to_check: list[int]):
        # check if date is between 06:00 and 18:00
    current_time = datetime.now(tzinfo)
    if current_time.hour > 6 and current_time.hour < 9 or current_time.hour > 15 and current_time.hour < 18:
        scheduler.enter(300, 1, main_traffic, (engine,scheduler, lines_to_check))
        print("Traffic recorded")
    else:
        scheduler.enter(300, 1, main_traffic, (engine,scheduler, lines_to_check))
        return
    

    checking_lines = ""    
    for line in lines_to_check:
        checking_lines += f'"{line}, '
        specific_journey, reversed_specifc_journey = find_specific_journey(engine, line)
        if specific_journey is None:
            print(f"No specific journey found for line {line}")
            continue
        if not specific_journey.empty:
            specific_journey_pipeline(engine, specific_journey)
        if not reversed_specifc_journey.empty:
            specific_journey_pipeline(engine,reversed_specifc_journey)

    print("Checking lines: ", checking_lines)
    

def specific_journey_pipeline(engine: Engine ,specific_journey: pd.DataFrame):
    locations = get_all_locations(engine, specific_journey["MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef"].values[0])

    stops = get_all_stops(engine, locations)

    # encode polyline from lat, long
    # print(polyline.encode(stops[["latitude", "longitude"]].values.tolist()))
    # print(polyline.encode([(x['latitude'], x['longitude']) for x in stops]))
    
    legs = split_stops(stops)

    new_legs = []
    for leg in legs:
        if len(leg) > 50:
            new_legs.append(leg[:len(leg)//2])
            new_legs.append(leg[len(leg)//2:])
        else:
            new_legs.append(leg)


    legs = new_legs

    for i in range(len(legs)):
        legs[i] = remove_every_other_stop(legs[i])

    legs_reversed = []
    for i in range(len(legs) - 1, -1, -1):
        legs_reversed.append(legs[i].iloc[::-1])

    # for leg in legs:
    #     print(leg["name"])
    # for leg in legs_reversed:
    #     print(leg["name"])

    print(f"Getting routes for {specific_journey['MonitoredVehicleJourney.LineRef'].values[0]}")
    responses = call_google_api(legs)
    save_responses_to_db(engine, responses, specific_journey)

    # responses = call_google_api(legs_reversed)
    # save_responses_to_db(engine, responses, reversed_specifc_journey)

def create_traffic_table(engine: Engine):
    lines_to_check = [1033, 1007, 1008, 1012]
    a = pd.DataFrame(lines_to_check, columns=["buses"])
    a.to_sql('LinesToWatch', engine, if_exists='replace', index=False)

if __name__ == "__main__": 
    engine = create_engine('sqlite:///test.db', echo=False)
    # lines_to_check = [1005] # x60, 6, 3, 7, 42
    lines_to_watch = pd.read_sql_query(f'SELECT * FROM LinesToWatch', engine)
    lines_to_watch = lines_to_watch["buses"].values.tolist()
    print(lines_to_watch)
    my_scheduler = sched.scheduler(time.time, time.sleep)
    main_traffic(engine, my_scheduler, lines_to_watch)
    


# Line 6
# firstStop = "NSR:Quay:46963"
# line = 1007
# vehicle = 2247
# timestamp = '2024-02-02T17:27:16+01:00'
# endtimestamp = '2024-02-02T19:27:16+01:00'
