using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class DataHub : Hub
{
    private readonly IAIService _openAIService;

    public DataHub(IAIService openAIService)
    {
        _openAIService = openAIService;
    }
    public async Task NewMessage(ChatMessage[] messages, object[] tools)
    {
        OpenAIResponse answer;
        try
        {
        answer = await _openAIService.SendChat(messages, tools);

        }
        catch (Exception ex) 
        {
            await Clients.All.SendAsync("messageReceived", ex);
            return;
        }

        List<ChatMessage> messageList = messages.ToList();
        messageList.Add(answer.Choices[0].Message);
        if (answer.Choices[0].Message.tool_calls != null && answer.Choices[0].Message.tool_calls.Length > 0)
        {
            await Clients.All.SendAsync("callFunction", messageList);
            return;
        }
        
        await Clients.All.SendAsync("messageReceived", messageList);
    }
}
