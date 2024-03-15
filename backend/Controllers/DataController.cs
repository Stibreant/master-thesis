using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ADO.Net;
using Microsoft.EntityFrameworkCore;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class DataController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;
    private readonly TestContext _db;
    private readonly IHubContext<DataHub> _dataHub;

    public DataController(ILogger<WeatherForecastController> logger, TestContext db, IHubContext<DataHub> hub)
    {
        SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
        builder.DataSource = "";
        _logger = logger;
        _db = db;
        _dataHub = hub;
    }

    [HttpPost("", Name = "PostAsync")]
    public async Task<string> PostAsync([FromBody] Vehicle[] DatedframeId)
    {
        _logger.LogInformation(JsonSerializer.Serialize(DatedframeId));
        //_logger.LogInformation(DatedframeId);
        await _dataHub.Clients.All.SendAsync("dataReceived", DatedframeId);
        return "Success";
    }

    [HttpGet("{datedframeId}",Name = "GetData")]
    public async Task<string> GetAsync(string datedframeId)
    {
        HttpClient client = new HttpClient();
        client.BaseAddress = new Uri("https://api.kolumbus.no");
        HttpResponseMessage response = await client.GetAsync($"/api/journeys/{datedframeId}/polyline");
        return await response.Content.ReadAsStringAsync();
    }

    [HttpGet("latest", Name = "GetLatestAsync")]
    public string GetLatestAsync()
    {
        Vehicle[] lines = _db.Vehicles.Where(v => v.ResponseTimestamp == _db.Vehicles.Max(v => v.ResponseTimestamp)).ToArray();
        return JsonSerializer.Serialize(lines);
    }

    [HttpGet("lineInfo/{line}", Name = "GetLineInfoAsync")]
    public async Task<string> GetLineInfoAsync(int line)
    {
        HttpClient client = new HttpClient();
        client.BaseAddress = new Uri("https://api.kolumbus.no");
        string prefix = "KOL:Line:8_";
        HttpResponseMessage response = await client.GetAsync($"/api/lines/{prefix}{line}");
        return await response.Content.ReadAsStringAsync();
    }
}
