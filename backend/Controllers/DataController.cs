using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ADO.Net;
using Microsoft.EntityFrameworkCore;
using backend.Hubs;
using System.Web;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class DataController : ControllerBase
{
    private readonly ILogger<DataController> _logger;
    private readonly TestContext _db;
    private readonly IHubContext<DataHub> _dataHub;
    private readonly IMemoryCache _memoryCache;

    public DataController(ILogger<DataController> logger, TestContext db, IHubContext<DataHub> hub, IMemoryCache memoryCache)
    {
        SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
        builder.DataSource = "";
        _logger = logger;
        _db = db;
        _dataHub = hub;
        _memoryCache = memoryCache;
    }

    [HttpPost("", Name = "PostAsync")]
    public async Task<string> PostAsync([FromBody] Vehicle[] DatedframeId)
    {
        //_logger.LogInformation(JsonSerializer.Serialize(DatedframeId));
        //_logger.LogInformation(DatedframeId);
        _memoryCache.Set("test", DatedframeId);
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
    public Vehicle[]? GetLatestAsync()
    {
        //Vehicle[] lines = _db.Vehicles.Where(v => v.ResponseTimestamp == _db.Vehicles.Max(v => v.ResponseTimestamp)).ToArray();
        //return JsonSerializer.Serialize(lines);
        return _memoryCache.Get<Vehicle[]>("test");
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
