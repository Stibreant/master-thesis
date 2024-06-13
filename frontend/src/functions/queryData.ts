

const QueryDataSpec = {
    "type": "function",
    "function": {
        "name": "QueryData",
    "description": "Use this function to run a Raw SQL query the backend. For example a user may ask for the average delay of a bus line between two dates. Then this function should be called with the corresponding SQL query, for an SQLite database. The query should be a SELECT statement. The result of the query is returned to the frontend. If the query fails do not reattempt the Function. Only use this to get New data from the databaes.",
        "parameters": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "A description of what you called with the inputs. This is displayed in the UI, for the user."
                },
                "sqlQuery": {
                    "type": "string",
                    "description": `The SQL query to be run on the database. This should be a SELECT statement. 
                    For example the user may ask what is the average delay between 2pm and 4pm on a specific bus line in the last week. The query should be written accordingly.
                    Note that the timezone the user is in should be taken into account. It is always +2 hours from the UTC time.
                    SELECT * FROM Vehicles WHERE \"MonitoredVehicleJourney.LineRef\" = '1005' AND date(recordedAtTime) BETWEEN '2024-04-15' AND '2024-04-20' AND time(recordedAtTime) BETWEEN '12:00:00' AND '14:00:00' LIMIT 1000;`
                },
                "TableName": {
                    "type": "string",
                    "description": "The name of the table to run the query on."
                },
            },
            "required": ["description", "sqlQuery"],
        },
    }
}

export default QueryDataSpec;