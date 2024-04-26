import { busDataTypeString } from "./busDataType";

const filterDataSpec = {
    "type": "function",
    "function": {
        "name": "filterData",
        "description": "Use this function to filter the data shown on the map. The function will return the filtered data.",
        "parameters": {
            "type": "object",
            "properties": {
                "filter": {
                    "type": "string",
                    "description": `The filter needs to be an boolean expression for the data.
                    For example to filter out all buses with a speed over 50 the filter would be "bus.monitoredVehicleJourneyVelocity > 50".
                    The possible keys for the bus object are in this type: ${busDataTypeString}.
                    The expression should always be on the form bus.[key] [operator] [value] with multiple conditions possible.
                    The filter needs to work in TypeScript.
                    Several values may be null or undefined, so make sure to check for that in the filter.
                    `
                },
                "description": {
                    "type": "string",
                    "description": "A description of the filter that is user-friendly and displayed in the UI. An example is 'Sure, filtering to all busses going over 50 km/h', if the prompt was asking for busses going over 50 km/h. Preferably the actual input to the filter should be included in the description."
                }
                
            },
            "required": ["filter"],
        },
    }
}

export default filterDataSpec;