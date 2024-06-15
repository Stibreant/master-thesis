namespace backend;

public partial class Vehicle
{
    public string? RecordedAtTime { get; set; }

    public string? ValidUntilTime { get; set; }

    public string? ResponseTimestamp { get; set; }

    public string? MonitoredVehicleJourneyLineRef { get; set; }

    public DateOnly? MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef { get; set; }

    public string? MonitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef { get; set; }

    public string? MonitoredVehicleJourneyVehicleMode { get; set; }

    public string? MonitoredVehicleJourneyOperatorRef { get; set; }

    public string? MonitoredVehicleJourneyOriginRef { get; set; }

    public string? MonitoredVehicleJourneyOriginNameXmlLang { get; set; }

    public string? MonitoredVehicleJourneyOriginNameText { get; set; }

    public string? MonitoredVehicleJourneyDestinationRef { get; set; }

    public string? MonitoredVehicleJourneyDestinationNameXmlLang { get; set; }

    public string? MonitoredVehicleJourneyDestinationNameText { get; set; }

    public string? MonitoredVehicleJourneyOriginAimedDepartureTime { get; set; }

    public string? MonitoredVehicleJourneyDestinationAimedArrivalTime { get; set; }

    public string? MonitoredVehicleJourneyMonitored { get; set; }

    public string? MonitoredVehicleJourneyDataSource { get; set; }

    public decimal? MonitoredVehicleJourneyVehicleLocationLongitude { get; set; }

    public decimal? MonitoredVehicleJourneyVehicleLocationLatitude { get; set; }

    public decimal? MonitoredVehicleJourneyBearing { get; set; }

    public string? MonitoredVehicleJourneyVelocity { get; set; }

    public string? MonitoredVehicleJourneyDelay { get; set; }

    public string? MonitoredVehicleJourneyVehicleStatus { get; set; }

    public string? MonitoredVehicleJourneyVehicleRef { get; set; }

    public string? MonitoredVehicleJourneyMonitoredCallStopPointRef { get; set; }

    public string? MonitoredVehicleJourneyMonitoredCallStopPointName { get; set; }

    public decimal? MonitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLongitude { get; set; }

    public decimal? MonitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLatitude { get; set; }

    public string? MonitoredVehicleJourneyMonitoredCallDestinationDisplay { get; set; }

    public string? MonitoredVehicleJourneyIsCompleteStopSequence { get; set; }
}
