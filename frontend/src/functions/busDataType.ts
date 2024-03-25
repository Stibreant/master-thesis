type busDataType = {    
    monitoredVehicleJourneyBearing: number,
    monitoredVehicleJourneyDataSource: string,
    monitoredVehicleJourneyDelay: string,
    monitoredVehicleJourneyDestinationAimedArrivalTime: string,
    monitoredVehicleJourneyDestinationNameText: string, 
    monitoredVehicleJourneyDestinationNameXmlLang: string,
    monitoredVehicleJourneyDestinationRef: string, 
    monitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef: string,
    monitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef: string,
    monitoredVehicleJourneyIsCompleteStopSequence: boolean,
    monitoredVehicleJourneyLineRef: number, 
    monitoredVehicleJourneyMonitored: boolean, 
    monitoredVehicleJourneyMonitoredCallDestinationDisplay: string,
    monitoredVehicleJourneyMonitoredCallStopPointName: string, 
    monitoredVehicleJourneyMonitoredCallStopPointRef: string, 
    monitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLatitude: number,
    monitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLongitude:number,
    monitoredVehicleJourneyOperatorRef: number,
    monitoredVehicleJourneyOriginAimedDepartureTime: string,
    monitoredVehicleJourneyOriginNameText: string | null, 
    monitoredVehicleJourneyOriginNameXmlLang: string | null,
    monitoredVehicleJourneyOriginRef: string,
    monitoredVehicleJourneyVehicleLocationLatitude: number,
    monitoredVehicleJourneyVehicleLocationLongitude: number,
    monitoredVehicleJourneyVehicleMode: string,
    monitoredVehicleJourneyVehicleRef: number,
    //Enumerate
    monitoredVehicleJourneyVehicleStatus: string,
    monitoredVehicleJourneyVelocity: number,
    recordedAtTime: string,
    responseTimestamp: string,
    validUntilTime: string
}

export const busDataTypeString = `{    
    monitoredVehicleJourneyBearing: number,
    monitoredVehicleJourneyDataSource: string,
    monitoredVehicleJourneyDelay: string,
    monitoredVehicleJourneyDestinationAimedArrivalTime: string,
    monitoredVehicleJourneyDestinationNameText: string, 
    monitoredVehicleJourneyDestinationNameXmlLang: string,
    monitoredVehicleJourneyDestinationRef: string, 
    monitoredVehicleJourneyFramedVehicleJourneyRefDataFrameRef: string,
    monitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef: string,
    monitoredVehicleJourneyIsCompleteStopSequence: boolean,
    monitoredVehicleJourneyLineRef: number, 
    monitoredVehicleJourneyMonitored: boolean, 
    monitoredVehicleJourneyMonitoredCallDestinationDisplay: string,
    monitoredVehicleJourneyMonitoredCallStopPointName: string, 
    monitoredVehicleJourneyMonitoredCallStopPointRef: string, 
    monitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLatitude: number,
    monitoredVehicleJourneyMonitoredCallVehicleLocationAtStopLongitude:number,
    monitoredVehicleJourneyOperatorRef: number,
    monitoredVehicleJourneyOriginAimedDepartureTime: string,
    monitoredVehicleJourneyOriginNameText: string | null, 
    monitoredVehicleJourneyOriginNameXmlLang: string | null,
    monitoredVehicleJourneyOriginRef: string,
    monitoredVehicleJourneyVehicleLocationLatitude: number,
    monitoredVehicleJourneyVehicleLocationLongitude: number,
    monitoredVehicleJourneyVehicleMode: string,
    monitoredVehicleJourneyVehicleRef: number,
    monitoredVehicleJourneyVehicleStatus: string,
    monitoredVehicleJourneyVelocity: number,
    recordedAtTime: string,
    responseTimestamp: string,
    validUntilTime: string
}`
export default busDataType;