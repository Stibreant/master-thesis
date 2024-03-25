using backend.DTO;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using System.Text;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;
        private readonly IHubContext<DataHub> _dataHub;
        private readonly OpenAIService openAIService = new OpenAIService();

        public ChatController(ILogger<DataController> logger, IHubContext<DataHub> hub)
        {
            _logger = logger;
            _dataHub = hub;
        }

        [HttpPost("", Name = "PostAsync2")]
        public async Task<string> PostAsync([FromBody] ChatMessage[] messages)
        {
            //HttpClient client = new HttpClient();
            //client.BaseAddress = new Uri("https://api.openai.com/v1/chat/");
            //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "completions");
            //string key = "";
            //client.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
            //request.Headers.Add("Authorization", $"Bearer {key}");
            //var messages = new ChatMessage[] { new ChatMessage { Content = "Say this is a second test", role = "user"}, new ChatMessage { Content = "Also say this is a second test", role = "user" } };

            //var options = new JsonSerializerOptions
            //{
            //    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            //};

            //StringContent content = new StringContent(JsonSerializer.Serialize(new OpenAIRequest("gpt-3.5-turbo", messages), options), Encoding.UTF8, "application/json");

            //HttpResponseMessage response = await client.PostAsync("completions", content);

            //if (response.IsSuccessStatusCode)
            //{
            //    // Read the content as a string asynchronously
            //    string jsonString = await response.Content.ReadAsStringAsync();

            //    // Parse the JSON string into a JObject
            //    OpenAIResponse json = JsonSerializer.Deserialize<OpenAIResponse>(jsonString, options)!;
            //    _logger.LogInformation(json.Choices[0].Message.Content);

            //}

            //return await response.Content.ReadAsStringAsync();
            messages = new ChatMessage[] { new ChatMessage { Content = "Say this is a second test", role = "user" }, new ChatMessage { Content = "Also say this is a second test", role = "user" } };
            return await openAIService.SendChat(messages);
        }

//        curl https://api.openai.com/v1/chat/completions \
//  -H "Content-Type: application/json" \
//  -H "Authorization: Bearer $OPENAI_API_KEY" \
//  -d '{
//     "model": "gpt-3.5-turbo",
//     "messages": [{"role": "user", "content": "Say this is a test!"}],
//     "temperature": 0.7
//   }
//'
    }
}
