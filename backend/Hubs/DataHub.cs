using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class DataHub : Hub
{
    public async Task NewMessage(string username, string message)
    {
        await Clients.All.SendAsync("messageReceived", username, message);
    }
}
