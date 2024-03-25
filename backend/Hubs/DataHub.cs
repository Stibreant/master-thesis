using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class DataHub : Hub
{
    private readonly OpenAIService _openAIService = new OpenAIService();
    public async Task NewMessage(ChatMessage[] messages)
    {
        ChatMessage message = new ChatMessage();
        message.role = "bot";
        message.Content = "This is new";
        var answer = await _openAIService.SendChat(messages);
        await Clients.All.SendAsync("messageReceived", answer);
    }
}
