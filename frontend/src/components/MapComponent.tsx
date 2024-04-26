import { Icon, LatLngExpression } from 'leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"

import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import Connector from '../hub/DatahubClient'
import BusMarkerComponent from './BusMarkerComponent'
import L from 'leaflet';
// import { HeatmapOverlay } from 'leaflet-heatmap'
// import HeatmapLayer from 'react-leaflet-heatmap-layer'
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3'

const MapComponent = () => {
  const [coordinates] = useState<LatLngExpression>([58.93730820230997, 5.697275755646442]);
  const [busData, setBusData] = useState<any>([]);
  const [displayedData, setDisplayedData] = useState<any>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [heatmapFilter, setHeatmapFilter] = useState<HeatMapFilter | null>(null);
  const { events } = Connector();



  useEffect(() => {
    events((_) => { return }, (data) => setBusData(data), (name: string, args: any) => {
      console.log(busData)
      if (name === "filterData") {
        args = JSON.parse(args);
        console.log(args)
        // if (!args.key || !args.filter || args.key === "" || args.filter === "") {
        //   setFilter(null);
        //   return;
        // }
        console.log("Filtering data", args.key, args.filter)
        setFilter(args.filter)
      }

      if (name === "heatData") {
        args = JSON.parse(args);
        setHeatmapFilter(args)
      }
    });
    // Fetch latest data
    if (busData.length === 0) {

      console.log("Fetching latest data");
      fetch(`${process.env.REACT_APP_BACKEND_URL}/data/latest`)
        .then(response => {
          try {
            let json = response.json()
            return json
          }
          catch (error) {
            console.error(error)
          }
        })
        .then(data => {
          if (busData.length === 0 && data) { setBusData(data) }
        }).catch((error) => console.error(error));
    }
  });

  useEffect(() => {
    if (!filter) {
      setDisplayedData(busData)
    }
    else {
      filterData(filter)
    }
  }, [busData, filter])

  const filterData = (filter: string) => {
    let filteredData = busData.filter((bus: any) => {
      return eval(filter);
    });
    setDisplayedData(filteredData);
  }

  return (
    <>
      <div style={{ display: "flex", minHeight: "calc(100vh - 41.5px)" }}>
        {/* <div id='map' style={{height: "180px", width: "180px"}}> */}
        <MapContainer center={coordinates} zoom={13} scrollWheelZoom={true} style={{ flex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BusMarkerComponent busData={displayedData} />
          <BusStopsComponent />
          <TestComponent />
          <HeatMapComponent heatmapFilter={heatmapFilter}/>
        </MapContainer>
      </div>
      {/* </div> */}
    </>
  );
}

type HeatMapFilter = {
  startTime: string,
  endTime: string,
  busLine?: string
}

type HeatMapProps = {
  heatmapFilter: HeatMapFilter | null
}

const HeatMapComponent = ({heatmapFilter}: HeatMapProps) => {
  // const tester = [[58.914, 5.697275755646442, 1], [58.91, 5.697275755646442, 5], [58.92, 5.697275755646442, 10]]
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // setData(addressPoints)
    if (heatmapFilter) {
      fetchHeatData(heatmapFilter)
    }
  }, [heatmapFilter])

  const fetchHeatData = (heatmapFilter: HeatMapFilter) => {
    let busLine: number = 1008;
    if (heatmapFilter.busLine) {
      busLine = parseInt(heatmapFilter.busLine);
    }  
    var params = new URLSearchParams();
    params.append('startTime', heatmapFilter.startTime);
    params.append('endTime', heatmapFilter.endTime);
    console.log(params)
    console.log(params.toString())
    fetch(`${process.env.REACT_APP_BACKEND_URL}/data/TrafficData/${busLine}?${params}`).then(response => {
      response.json().then(res => {

        // Calculate delta delay
        for (let k = 0; k < res.length; k++) {
          const elementDay = res[k];
          for (let j = 0; j < elementDay.length; j++) {
            const elementJourney = elementDay[j];
            for (let i = 0; i < elementJourney.length; i++) {
              const element = elementJourney[i];
              if (i === 0) {
                element["deltaDelay"] = 0;
              } else {
                element["deltaDelay"] = parseDurationToFloat(elementJourney[i]["monitoredVehicleJourneyDelay"]) - parseDurationToFloat(elementJourney[i - 1]["monitoredVehicleJourneyDelay"]);
              }
            }
          }
        }
        console.log(res);
        const temp = res.flatMap((objArray: any) => objArray.flatMap((t: any) => t))
        console.log(temp);
        setData(temp);
      })
    })
  }

  function parseDurationToFloat(durationString: string): number {
    if (!durationString) {
      return 0;
    }
    // Regular expression to match the pattern
    const regex = /PT(?:(\d+)M)?(?:(\d+)S)?/;

    // Extract minutes and seconds from the string using regex
    const match = durationString.match(regex);

    if (!match) {
      alert(durationString)
      throw new Error("Invalid duration string format");
    }

    // Extract minutes and seconds from the regex match, defaulting to 0 if not present
    const minutes = match[1] ? parseInt(match[1], 10) : 0;
    const seconds = match[2] ? parseInt(match[2], 10) : 0;

    // Calculate the total duration in seconds
    const totalSeconds = minutes * 60 + seconds;

    // Convert to float
    const totalSecondsFloat = parseFloat(totalSeconds.toFixed(2));

    return totalSecondsFloat;
  }


  return (
    <>
      {data.length > 0 ?
        <>
          {data.map((point: any) => {
            return (
              <Marker position={[point["monitoredVehicleJourneyVehicleLocationLatitude"], point["monitoredVehicleJourneyVehicleLocationLongitude"]]}
                icon={new Icon({ iconUrl: markerIconPng, iconAnchor: [12, 41] })}>
                <Popup>{point.deltaDelay}</Popup>
              </Marker>
            )
          })
          }
          <HeatmapLayer
            // fitBoundsOnLoad
            // fitBoundsOnUpdate
            points={data}
            longitudeExtractor={(m: any) => m["monitoredVehicleJourneyVehicleLocationLongitude"]}
            latitudeExtractor={(m: any) => m["monitoredVehicleJourneyVehicleLocationLatitude"]}
            intensityExtractor={(m: any) => m["deltaDelay"]}
            radius={10}
          // max={10}
          // minOpacity={1}
          // useLocalExtrema={true}
          />
        </>
        : <></>
      }
    </>
  )
}

const TestComponent = () => {
  const [position, setPosition] = useState<LatLngExpression | null>();
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      circle.addTo(map);
      // setBbox(e.bounds.toBBoxString().split(","));
    });
  }, [map]);
  return (
    <>
      {position ?
        <Marker position={position} icon={new Icon({ iconUrl: markerIconPng, iconAnchor: [12, 41] })}>
          <Popup>You are here!</Popup>
        </Marker>
        : <></>}
    </>
  )
}

const BusStopsComponent = () => {
  const [busStops, setBusStops] = useState<any>(null);

  const map = useMap();

  useEffect(() => {
    // Load initial BustStops
    fetch(`${process.env.REACT_APP_BACKEND_URL}/data/busStops`)
      .then(response => {
        response.json().then(res => {
          console.log(res)
          map.flyTo([res.features[0].geometry.coordinates[1], res.features[0].geometry.coordinates[0]], 13)
          setBusStops(res)
        })
      })
  }, [])
  return (<>
    {busStops ? busStops.features.map((busStop: any) => {
      return (
        <Marker position={[busStop.geometry.coordinates[1], busStop.geometry.coordinates[0]]} icon={new Icon({ iconUrl: "./busStop.gif", iconSize: [76 / 4, 49 / 4] })}>
          <Popup>{busStop.properties.name} : {busStop.properties.id}</Popup>
        </Marker>
      )
    }) : <></>
    }
  </>)
}

export default MapComponent;