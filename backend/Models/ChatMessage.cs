namespace backend.Models
{
    public class ChatMessage
    {
        public string? role { get; set; }

        public string? Content { get; set; }

    }

    public class OpenAIRequest
    { 
        public ChatMessage[] Messages { get; set; }
        public string Model { get; set; }
        public float? Temperature { get; set; }

        public OpenAIRequest(string todel , ChatMessage[] messages) {
            Model = todel;
            Messages = messages;
        }

    }

    public class OpenAIResponse
    { 
        public OpenAIChoice[] Choices { get; set; }
    }

    public class OpenAIChoice
    {
        public ChatMessage Message { get; set;  }
    }
}
