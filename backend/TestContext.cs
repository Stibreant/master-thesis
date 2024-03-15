using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend;

public partial class TestContext : DbContext
{
    public TestContext()
    {
    }

    public TestContext(DbContextOptions<TestContext> options)
        : base(options)
    {
    }

    public virtual DbSet<LinesToWatch> LinesToWatches { get; set; }

    public virtual DbSet<Platform> Platforms { get; set; }

    public virtual DbSet<Route> Routes { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlite("Data Source=C:\\Users\\stian\\source\\repos\\master\\test.db");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LinesToWatch>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("LinesToWatch");

            entity.Property(e => e.Buses)
                .HasColumnType("BIGINT")
                .HasColumnName("buses");
        });

        modelBuilder.Entity<Platform>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.Changed).HasColumnName("changed");
            entity.Property(e => e.Created).HasColumnName("created");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ExternalId).HasColumnName("external_id");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Latitude)
                .HasColumnType("FLOAT")
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasColumnType("FLOAT")
                .HasColumnName("longitude");
            entity.Property(e => e.Modification).HasColumnName("modification");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.NsrId).HasColumnName("nsr_id");
            entity.Property(e => e.PrivateCode).HasColumnName("private_code");
            entity.Property(e => e.PublicCode).HasColumnName("public_code");
            entity.Property(e => e.StopPlaceId).HasColumnName("stop_place_id");
            entity.Property(e => e.SubModeType).HasColumnName("sub_mode_type");
            entity.Property(e => e.TransportMode).HasColumnName("transport_mode");
            entity.Property(e => e.Type).HasColumnName("type");
        });

        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.Date)
                .HasColumnType("TIMESTAMP")
                .HasColumnName("date");
            entity.Property(e => e.Destination).HasColumnName("destination");
            entity.Property(e => e.DistanceMeters)
                .HasColumnType("BIGINT")
                .HasColumnName("distanceMeters");
            entity.Property(e => e.Duration).HasColumnName("duration");
            entity.Property(e => e.Polyline).HasColumnName("polyline");
            entity.Property(e => e.RouteNumber).HasColumnName("route_number");
            entity.Property(e => e.ServiceId).HasColumnName("service_id");
            entity.Property(e => e.StaticDuration).HasColumnName("staticDuration");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.MonitoredVehicleJourneyBearing).HasColumnName("MonitoredVehicleJourney.Bearing");
            entity.Property(e => e.MonitoredVehicleJourneyDataSource).HasColumnName("MonitoredVehicleJourney.DataSource");
            entity.Property(e => e.MonitoredVehicleJourneyDelay).HasColumnName("MonitoredVehicleJourney.Delay");
            entity.Property(e => e.MonitoredVehicleJourneyDestinationAimedArrivalTime).HasColumnName("MonitoredVehicleJourney.DestinationAimedArrivalTime");
            entity.Property(e => e.MonitoredVehicleJourneyDestinationNameText).HasColumnName("MonitoredVehicleJourney.DestinationName.#text");
            entity.Property(e => e.MonitoredVehicleJourneyDestinationNameXmlLang).HasColumnName("MonitoredVehicleJourney.DestinationName.@xml:lang");
            entity.Property(e => e.MonitoredVehicleJourneyDestinationRef).HasColumnName("MonitoredVehicleJourney.DestinationRef");
            entity.Property(e => e.MonitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef).HasColumnName("MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef");
            entity.Property(e => e.MonitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef).HasColumnName("MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef");
            entity.Property(e => e.MonitoredVehicleJourneyIsCompleteStopSequence).HasColumnName("MonitoredVehicleJourney.IsCompleteStopSequence");
            entity.Property(e => e.MonitoredVehicleJourneyLineRef).HasColumnName("MonitoredVehicleJourney.LineRef");
            entity.Property(e => e.MonitoredVehicleJourneyMonitored).HasColumnName("MonitoredVehicleJourney.Monitored");
            entity.Property(e => e.MonitoredVehicleJourneyMonitoredCallDestinationDisplay).HasColumnName("MonitoredVehicleJourney.MonitoredCall.DestinationDisplay");
            entity.Property(e => e.MonitoredVehicleJourneyMonitoredCallStopPointName).HasColumnName("MonitoredVehicleJourney.MonitoredCall.StopPointName");
            entity.Property(e => e.MonitoredVehicleJourneyMonitoredCallStopPointRef).HasColumnName("MonitoredVehicleJourney.MonitoredCall.StopPointRef");
            entity.Property(e => e.MonitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLatitude).HasColumnName("MonitoredVehicleJourney.MonitoredCall.VehicleLocationAtStop.Latitude");
            entity.Property(e => e.MonitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLongitude).HasColumnName("MonitoredVehicleJourney.MonitoredCall.VehicleLocationAtStop.Longitude");
            entity.Property(e => e.MonitoredVehicleJourneyOperatorRef).HasColumnName("MonitoredVehicleJourney.OperatorRef");
            entity.Property(e => e.MonitoredVehicleJourneyOriginAimedDepartureTime).HasColumnName("MonitoredVehicleJourney.OriginAimedDepartureTime");
            entity.Property(e => e.MonitoredVehicleJourneyOriginNameText).HasColumnName("MonitoredVehicleJourney.OriginName.#text");
            entity.Property(e => e.MonitoredVehicleJourneyOriginNameXmlLang).HasColumnName("MonitoredVehicleJourney.OriginName.@xml:lang");
            entity.Property(e => e.MonitoredVehicleJourneyOriginRef).HasColumnName("MonitoredVehicleJourney.OriginRef");
            entity.Property(e => e.MonitoredVehicleJourneyVehicleLocationLatitude).HasColumnName("MonitoredVehicleJourney.VehicleLocation.Latitude");
            entity.Property(e => e.MonitoredVehicleJourneyVehicleLocationLongitude).HasColumnName("MonitoredVehicleJourney.VehicleLocation.Longitude");
            entity.Property(e => e.MonitoredVehicleJourneyVehicleMode).HasColumnName("MonitoredVehicleJourney.VehicleMode");
            entity.Property(e => e.MonitoredVehicleJourneyVehicleRef).HasColumnName("MonitoredVehicleJourney.VehicleRef");
            entity.Property(e => e.MonitoredVehicleJourneyVehicleStatus).HasColumnName("MonitoredVehicleJourney.VehicleStatus");
            entity.Property(e => e.MonitoredVehicleJourneyVelocity).HasColumnName("MonitoredVehicleJourney.Velocity");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
