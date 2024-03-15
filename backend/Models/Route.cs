using System;
using System.Collections.Generic;

namespace backend;

public partial class Route
{
    public string? Duration { get; set; }

    public string? StaticDuration { get; set; }

    public long? DistanceMeters { get; set; }

    public string? Polyline { get; set; }

    public DateTime? Date { get; set; }

    public string? ServiceId { get; set; }

    public string? RouteNumber { get; set; }

    public string? Destination { get; set; }
}
