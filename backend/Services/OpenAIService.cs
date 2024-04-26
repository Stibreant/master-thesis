using backend.Models;
using System.Text.Json;
using System.Text;

namespace backend.Services
{
    public interface IAIService
    {
        public Task<OpenAIResponse> SendChat(ChatMessage[] Messages, object[] tools);
    }

    public class OpenAIService : IAIService
    {
        private string _openAiKey {  get; set; }
        public OpenAIService(IConfiguration configuration)
        {
            var key = configuration.GetValue<string>("OPEN_AI_KEY");
            if (key == null) { throw new ArgumentNullException(nameof(configuration)); }
            _openAiKey = key;
        }

        public async Task<OpenAIResponse> SendChat(ChatMessage[] Messages, object[] tools)
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri("https://api.openai.com/v1/chat/");
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "completions");
            string? key = _openAiKey;
            if (key == null) throw new Exception($"Unable to get OpenAI Key");

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
            request.Headers.Add("Authorization", $"Bearer {key}");

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull, 
            };

            // Insert instruction-message first
            var instructionMessage = new ChatMessage[] { 
                new ChatMessage { 
                    role = "user", 
                    Content = @"You are an AI in a web application that are suppose to answer any questions related to busses and public transport.
                    You're answers should always be short and precise.
                    When calling a function you should also provide a short explaination about what you called. 
                    This description should be non-technical so someone with no code knowledge understands what they are looking at"} };

            Messages = instructionMessage.Concat(Messages).ToArray();

            string contentString = JsonSerializer.Serialize(new OpenAIRequest("gpt-4-0125-preview", Messages, tools), options);
            StringContent content = new StringContent(contentString, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync("completions", content);

            if (response.IsSuccessStatusCode)
            {
                // Read the content as a string asynchronously
                string jsonString = await response.Content.ReadAsStringAsync();

                // Parse the JSON string into a JObject
                OpenAIResponse json = JsonSerializer.Deserialize<OpenAIResponse>(jsonString, options)!;

                return json;

            }

            throw new Exception($"Request failed:\n {await response.Content.ReadAsStringAsync()}");
        }
    }
}
