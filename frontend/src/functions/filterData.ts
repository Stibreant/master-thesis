import { busDataTypeString } from "./busDataType";

const filterDataSpec = {
    "type": "function",
    "function": {
        "name": "filterData",
        "description": "Use this function to filter the data shown on the map. The function will return the filtered data.",
        "parameters": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": `The key to filter the data on. For example, if you want to filter the data based on the line number, you would pass in 'monitoredVehicleJourneyLineRef'.
                    The keys that can be chosen are from the busDataType. Empty string if no filtering is desired The busDataType is as follows:
                    ${busDataTypeString}
                    
                    `
                },
                "filter": {
                    "type": "string",
                    "description": ` The value to filter the data on. For example, if you want to filter the data based on the line number 123, you would pass in 123.
                    Empty string if no filtering is desired
                    `
                }
            },
            "required": ["key", "filter"],
        },
    }
}

export default filterDataSpec;