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
        private readonly IAIService _openAIService;

        public ChatController(ILogger<DataController> logger, IHubContext<DataHub> hub, IAIService openAIService)
        {
            _logger = logger;
            _dataHub = hub;
            _openAIService = openAIService;
        }

        [HttpPost("", Name = "PostAsync2")]
        public async Task<OpenAIResponse> PostAsync([FromBody] ChatMessage[] messages)
        {
            return await _openAIService.SendChat(messages, [""]);
        }
    }
}
