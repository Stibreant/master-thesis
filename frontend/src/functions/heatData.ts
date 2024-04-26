

const heatDataSpec = {
    "type": "function",
    "function": {
        "name": "heatData",
        "description": "Use this function to show heat data on the map. This data shows the delay of the buses in a heatmap.",
        "parameters": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "A description of what you called with the inputs. This is displayed in the UI, for the user."
                },
                "startTime": {
                    "type": "string",
                    "description": "The beginning of the interval to look for data. The format is 'YYYY-MM-DDTHH:MM:SS'."
                },
                "endTime": {
                    "type": "string",
                    "description": "The end of the interval to look for data. The format is 'YYYY-MM-DDTHH:MM:SS'."
                },
                "busLine": {
                    "type": "number",
                    "description": "The specific line the user wants to look at. If not specified, all lines are shown."
                }
                
            },
            "required": ["description", "startTime", "endTime" ],
        },
    }
}

export default heatDataSpec;