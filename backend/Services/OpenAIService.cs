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

            string contentString = JsonSerializer.Serialize(new OpenAIRequest("gpt-3.5-turbo", Messages, tools), options);
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
