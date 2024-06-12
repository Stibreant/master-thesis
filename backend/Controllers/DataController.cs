using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ADO.Net;
using Microsoft.EntityFrameworkCore;
using backend.Hubs;
using System.Web;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using System;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Runtime.CompilerServices;

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

    [HttpGet("{datedframeId}", Name = "GetData")]
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
        var handler = new HttpClientHandler();
        handler.ClientCertificateOptions = ClientCertificateOption.Manual;
        handler.ServerCertificateCustomValidationCallback =
            (httpRequestMessage, cert, cetChain, policyErrors) =>
        {
            return true;
        };

        // var client = new HttpClient(handler);
        HttpClient client = new HttpClient(handler);
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
        var vehicles = _db.Vehicles
            .Where(v => v.MonitoredVehicleJourneyLineRef == line.ToString() && v.MonitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef != null
            && v.RecordedAtTime.CompareTo(startTime) > 0 && v.RecordedAtTime.CompareTo(endTime) < 0)
            .Take(10000)
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
        Console.WriteLine(vehicles.Count());
        var groups = new List<dynamic>();
        for (int i = 0; i < vehicles.Count(); i++)
        {
            var vehicle = vehicles[i];
            groups.Add(vehicle.GroupBy(v => v.MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef).ToList());
        }

        return groups;
    }

    [HttpPost("Query", Name = "QueryTrafficData")]
    public async Task<IEnumerable<dynamic>> QueryTrafficData([FromBody] string Query)
    {
       Console.WriteLine(Query);
        var result = new List<dynamic>();

        using (var connection = _db.Database.GetDbConnection())
        {
            await connection.OpenAsync();

            using (var command = connection.CreateCommand())
            {
                command.CommandText = Query;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    var columnNames = Enumerable.Range(0, reader.FieldCount)
                                                .Select(reader.GetName)
                                                .ToList();

                    while (await reader.ReadAsync())
                    {
                        var expandoObj = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;

                        foreach (var columnName in columnNames)
                        {
                            expandoObj[columnName] = reader[columnName];
                        }

                        result.Add(expandoObj);
                    }
                }
            }
        }

        return result;

    }
}
