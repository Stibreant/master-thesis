from db import get_db

def get_data(line):
    db = get_db()
    cursor = db.cursor()
    statement = 'SELECT * FROM Vehicles WHERE "MonitoredVehicleJourney.LineRef" = ?'
    cursor.execute(statement, [line])
    return cursor.fetchmany(100)
