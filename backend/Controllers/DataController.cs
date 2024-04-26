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

    [HttpGet("busStops", Name = "GetBusStopsAsync")]
    public async Task<string?> GetBusStopsAsync()
    {
        HttpClient client = new HttpClient();
        client.BaseAddress = new Uri("https://api.entur.io");
        HttpResponseMessage response = await client.GetAsync("/geocoder/v1/reverse?point.lat=58.93730820230997&point.lon=5.697275755646442&boundary.circle.radius=5&size=100&layers=venue");
        string responseString = await response.Content.ReadAsStringAsync();
        return responseString;
    }

    [HttpGet("TrafficData/{line}", Name = "GetTrafficData")]
    public async Task<IEnumerable<dynamic>> GetTrafficData(int line, [FromQuery] string startTime, [FromQuery] string endTime)
    {
        Console.WriteLine(startTime + " " + endTime);
        if (startTime == null || endTime == null)
        {
            return Enumerable.Empty<dynamic>();
        }
        var test2 = startTime.CompareTo("2024-04-22T11:00:00");
        var test3 = startTime.CompareTo("2024-04-22T18:00:00");
        DateOnly date = new DateOnly(2024, 3, 14);
        var vehicles = _db.Vehicles
            .Where(v => v.MonitoredVehicleJourneyLineRef == line.ToString() && v.MonitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef != null && v.MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef == date 
            && v.RecordedAtTime.CompareTo(startTime) > 0 && v.RecordedAtTime.CompareTo(endTime) < 0)
            .Take(1000)
            .Select(v => new
            {
                RecordedAtTime = v.RecordedAtTime,
                Key = v.MonitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef,
                MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef = v.MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef,
                MonitoredVehicleJourneyDelay = v.MonitoredVehicleJourneyDelay,
                MonitoredVehicleJourneyVehicleLocationLatitude = v.MonitoredVehicleJourneyVehicleLocationLatitude,
                MonitoredVehicleJourneyVehicleLocationLongitude = v.MonitoredVehicleJourneyVehicleLocationLongitude,

            })
            .ToList()
            .GroupBy(v => v.Key)
            .ToList();
        var groups = new List<dynamic>();
        for (int i = 0; i < vehicles.Count(); i++)
        {
            var vehicle = vehicles[i];
            groups.Add(vehicle.GroupBy(v => v.MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef).ToList());
        }
        
        return groups;
    }
}
