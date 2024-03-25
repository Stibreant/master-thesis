using backend.Models;
using System.Text.Json;
using System.Text;

namespace backend.Services
{
    public class OpenAIService
    {
        public async Task<string> SendChat(ChatMessage[] Messages)
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri("https://api.openai.com/v1/chat/");
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "completions");
            string key = "[YOUR_API_KEY]";
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
            request.Headers.Add("Authorization", $"Bearer {key}");

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            StringContent content = new StringContent(JsonSerializer.Serialize(new OpenAIRequest("gpt-3.5-turbo", Messages), options), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await client.PostAsync("completions", content);

            if (response.IsSuccessStatusCode)
            {
                // Read the content as a string asynchronously
                string jsonString = await response.Content.ReadAsStringAsync();

                // Parse the JSON string into a JObject
                OpenAIResponse json = JsonSerializer.Deserialize<OpenAIResponse>(jsonString, options)!;

                return json.Choices[0].Message.Content!;

            }

            return "ERROR: Request Failed";
        }
    }
}
