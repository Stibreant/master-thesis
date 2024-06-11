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

        if (answer.Choices[0].Message.tool_calls != null && answer.Choices[0].Message.tool_calls.Length > 0)
        {
            await Clients.All.SendAsync("callFunction", answer.Choices[0].Message.tool_calls![0].Function.Name, answer.Choices[0].Message.tool_calls![0].Function.Arguments);
            return;
        }
        
        await Clients.All.SendAsync("messageReceived", answer.Choices[0].Message.Content);
    }
}
