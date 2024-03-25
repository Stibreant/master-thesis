using backend.Models;

namespace backend.DTO
{
    public class OpenAIDto
    {
        public string? Model { get; set; }
        public ChatMessage[]? Messages { get; set; }
    }
}
