import requests
import xml.etree.ElementTree as ET
import pandas as pd
from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Boolean, Float
import xmltodict, json
import sched, time
from datetime import datetime, timezone, timedelta
import os

from traffic import create_traffic_table, generate_platform_table, main_traffic

DEBUGGING = True

timezone_offset = 1  # European Standard Time (UTC+01:00)
tzinfo = timezone(timedelta(hours=timezone_offset))

def fetch_data(engine, scheduler):
    scheduler.enter(15, 1, fetch_data, (engine,scheduler))
    try:
        url = 'https://api.entur.io/realtime/v1/rest/vm?datasetId=KOL'
        response = requests.get(url)
    except:
        return

    try:
        xmlAsDict = xmltodict.parse(response.content)
    except: 
        return

    try:
        VehicleActivities = xmlAsDict["Siri"]["ServiceDelivery"]["VehicleMonitoringDelivery"]["VehicleActivity"]

        responseTimestamp = xmlAsDict["Siri"]["ServiceDelivery"]["ResponseTimestamp"]
    except:
        return

    for i, e in enumerate(VehicleActivities):
        VehicleActivities[i]["ResponseTimestamp"] = responseTimestamp
        

    normal = pd.json_normalize(VehicleActivities)
    test = pd.json_normalize(VehicleActivities, sep="")

    # Sometimes the new data might have arrived before the old data is not valid anymore
    # This leads to the same vehicle being in the list twice in the same response
    # Sort by RecordedAtTime and drop duplicates
    normal = normal.sort_values('RecordedAtTime', ascending=False)
    normal = normal.drop_duplicates('MonitoredVehicleJourney.VehicleRef', keep='first')
    
    
   
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            normal.to_sql('Vehicles', conn, if_exists='append', index=False)
            trans.commit()
        except Exception as e:
            print("FATAL")
            print(e)
            trans.rollback()
    
    post_data(test)

def post_data(normal):
    url = "http://localhost:5143/data"
    headers = {'Content-type': 'application/json'}
    data = normal.to_json(orient='records')
    try: 
        response = requests.post(url, data=data, headers=headers)
    except:
        print("Failed to post data to server")
        pass


def create_table(engine):
    metadata = MetaData()

    # Create table from columns
    Table('Vehicles', metadata,
    Column('ResponseTimestamp', String, primary_key=True),
    Column('RecordedAtTime', String),
    Column('ValidUntilTime', String),
    Column('MonitoredVehicleJourney.LineRef', Integer),
    Column('MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef', String),
    Column('MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef', String),
    Column('MonitoredVehicleJourney.VehicleMode', String),
    Column('MonitoredVehicleJourney.OperatorRef', Integer),
    Column('MonitoredVehicleJourney.OriginRef', String),
    Column('MonitoredVehicleJourney.OriginName.@xml:lang', String),
    Column('MonitoredVehicleJourney.OriginName.#text', String),
    Column('MonitoredVehicleJourney.DestinationRef', String),
    Column('MonitoredVehicleJourney.DestinationName.@xml:lang', String),
    Column('MonitoredVehicleJourney.DestinationName.#text', String),
    Column('MonitoredVehicleJourney.OriginAimedDepartureTime', String),
    Column('MonitoredVehicleJourney.DestinationAimedArrivalTime', String),
    Column('MonitoredVehicleJourney.Monitored', Boolean),
    Column('MonitoredVehicleJourney.DataSource', String),
    Column('MonitoredVehicleJourney.VehicleLocation.Longitude', Float),
    Column('MonitoredVehicleJourney.VehicleLocation.Latitude', Float),
    Column('MonitoredVehicleJourney.Bearing', Float),
    Column('MonitoredVehicleJourney.Velocity', Integer),
    Column('MonitoredVehicleJourney.Delay', String),
    Column('MonitoredVehicleJourney.VehicleStatus', String),
    Column('MonitoredVehicleJourney.VehicleRef', Integer, primary_key=True),
    Column('MonitoredVehicleJourney.MonitoredCall.StopPointRef', String),
    Column('MonitoredVehicleJourney.MonitoredCall.StopPointName', String),
    Column('MonitoredVehicleJourney.MonitoredCall.VehicleLocationAtStop.Longitude', Float),
    Column('MonitoredVehicleJourney.MonitoredCall.VehicleLocationAtStop.Latitude', Float),
    Column('MonitoredVehicleJourney.MonitoredCall.DestinationDisplay', String),
    Column('MonitoredVehicleJourney.IsCompleteStopSequence', Boolean)
    )

    metadata.create_all(engine)


def log(engine, scheduler):
    scheduler.enter(120, 1, log, (engine,scheduler))
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM Vehicles")).fetchone()[0]
        with open("log.csv", "a") as file:
                file.write(f"{datetime.now(tzinfo)}, {count}, {os.stat('test.db').st_size/1_000_000}\n")

def printer(engine, scheduler):
    scheduler.enter(600, 1, printer, (engine,scheduler))
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM Vehicles")).fetchone()[0]
        print(f"({datetime.now(tzinfo)})   # rows: {count}    filesize: {os.stat('test.db').st_size/1_000_000} MB")

if __name__ == '__main__':
    engine = create_engine('sqlite:///test.db', echo=False)
    # create_table(engine)

    my_scheduler = sched.scheduler(time.time, time.sleep)

    fetch_data(engine, my_scheduler)
    log(engine, my_scheduler)
    printer(engine, my_scheduler)
    # lines_to_check = [1033, 1007, 1004, 1008, 1012] # x60, 6, 3, 7, 42

    create_traffic_table(engine)
    generate_platform_table(engine)
    if not DEBUGGING:
        lines_to_check = pd.read_sql_query(f'SELECT * FROM LinesToWatch', engine)["buses"].values.tolist()
        main_traffic(engine, my_scheduler, lines_to_check)
    my_scheduler.run()

    engine.dispose()

