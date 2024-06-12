namespace backend.Models
{
    public class ChatMessage
    {
        public string? role { get; set; }

        public string? Content { get; set; }
        public ToolCall[]? tool_calls { get; set; } = null;

        public string? tool_call_id { get; set; } = null;

        public string? name { get; set; } = null;
    }

    public class ToolCall
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public OpenAIFunction Function { get; set; }
    }

    public class OpenAIFunction
    {
        public string Name { get; set; }
        public object Arguments { get; set; }
    }

    public class OpenAIRequest
    {
        public ChatMessage[] Messages { get; set; }
        public string Model { get; set; }
        public float? Temperature { get; set; }
        public object[] Tools { get; set; }

        public OpenAIRequest(string model, ChatMessage[] messages, object[] tools) {
            Model = model;
            Messages = messages;
            Tools = tools;
        }

    }

    public class OpenAITool 
    {
        public string type { get; set; }
    }

    public class OpenAIFunctionTool
    {
        public string name { get; set; }
        public string description { get; set; }
    }

    public class OpenAIResponse
    { 
        public OpenAIChoice[] Choices { get; set; }
        public string finish_reason { get; set; }
    }

    public class OpenAIChoice
    {
        public ChatMessage Message { get; set;  }

    }
}
