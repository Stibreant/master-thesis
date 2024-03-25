import { Icon, LatLngExpression } from 'leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"

import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import Connector from '../hub/DatahubClient'

import L from 'leaflet';

const getCustomIcon = (rotationDegree: number, lineNumber: string) => {
  return L.divIcon({
    className: 'rotated-icon',
    html: `<div><span class="marker-icon-text">${lineNumber}</span><img src="./bus.png" class="map-icon-img" style="transform: rotate(${rotationDegree}deg);" /></div>`,
    iconSize: [46, 46]
  });
};

const MapComponent = () => {
  const [coordinates] = useState<LatLngExpression>([58.93730820230997, 5.697275755646442])
  const [busData, setBusData] = useState<any>([])
  const { events } = Connector();
  useEffect(() => {
    events((_) => { return }, (data) => setBusData(data));
    // Fetch latest data
    if (busData.length === 0) {

      console.log("Fetching latest data"); 
      fetch(`${process.env.REACT_APP_BACKEND_URL}/data/latest`)
        .then(response => response.json())
        .then(data => {
          if (busData.length === 0 && data) { setBusData(data) }
        });
    }
  });

  // useEffect(() => {
  //   setTimeout(() => {
  //     setMessage("sent")
  //     newMessage("Hello from the frontend")
  //   }, 1000);
  // }, []);

  // useEffect(() => {
  //   let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/data/KOL:ServiceJourney:1033_240111106398057_3002`)
  //   response.json().then(data => {
  //     let x = data.coordinates.map((coord: any) => [coord[1], coord[0]])
  //     setPolyline(x)
  //     // map.flyTo(x[0])
  //     // map.fitBounds([x[0], x[x.length - 1]])
  //     map.flyToBounds([x[0], x[x.length - 1]])
  //     // alert(data)
  //   })
  // },[])


  return (
    <>
      <div style={{ display: "flex", minHeight: "calc(100vh - 41.5px)" }}>


        {/* <div id='map' style={{height: "180px", width: "180px"}}> */}
        <MapContainer center={coordinates} zoom={13} scrollWheelZoom={true} style={{ flex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={coordinates} pathOptions={{ color: 'red' }} radius={200} />
          <Marker position={coordinates} icon={new Icon({ iconUrl: markerIconPng, iconAnchor: [12, 41] })}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
          <TestComponent busData={busData} />
        </MapContainer>
      </div>
      {/* </div> */}
    </>
  );
}

const TestComponent = ({ busData }: { busData: any }) => {
  const [position, setPosition] = useState<LatLngExpression[]>([])
  const [polyline, setPolyline] = useState<LatLngExpression[]>([])
  const [text, setText] = useState<string>("")
  const [cachedLineInfo, setCachedLineInfo] = useState<{ [key: number]: any }>({})


  // Load initial data
  useEffect(() => {
    if (Object.keys(cachedLineInfo).length === 0 && busData) {
      var checked: { [key: string]: boolean } = {};
      busData.forEach((bus: any, index: number) => {
        if (checked[bus.monitoredVehicleJourneyLineRef]) {
          return;
        }
        console.log("Fetching line info for", bus.monitoredVehicleJourneyLineRef)
        checked[bus.monitoredVehicleJourneyLineRef] = true;
        let line = bus.monitoredVehicleJourneyLineRef;
        let temp = fetch(`${process.env.REACT_APP_BACKEND_URL}/data/lineInfo/${line}`)
        temp.then(data => {
          data.json().then(data => {
            cachedLineInfo[bus.monitoredVehicleJourneyLineRef] = data
            setCachedLineInfo(cachedLineInfo)
          });
        });
      });
    }
  }, [busData])

  useEffect(() => {
    if (busData && busData.length > 0) {
      let buses = busData.map((bus: any) => [bus.monitoredVehicleJourneyVehicleLocationLatitude,
      bus.monitoredVehicleJourneyVehicleLocationLongitude])
      setPosition(buses);
    }
  }, [busData])

  const markerOnClick = async (index: number) => {
    setPolyline([]);
    setText("Loading...")
    let curVehicle = busData[index].monitoredVehicleJourneyFramedVehicleJourneyRefDatedVehicleJourneyRef;
    let line = busData[index].monitoredVehicleJourneyLineRef;
    let temp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/data/lineInfo/${line}`)
    temp.json().then(data => {
      setText(data.name)
    });
    let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/data/${curVehicle}`)
    if (!response.ok) {
      alert("No data found")
      return
    }
    response.json().then(data => {
      let x = data.coordinates.map((coord: any) => [coord[1], coord[0]])
      setPolyline(x)
    }).catch(async (err) => {
      alert()
    });
  }

  const getLineNumber: (index: number) => string = (index: number) => {
    try {
      // debugger;
      if (cachedLineInfo[busData[index].monitoredVehicleJourneyLineRef]) {
        return cachedLineInfo[busData[index].monitoredVehicleJourneyLineRef].name;
      }
      else {
        let bus = busData[index];
        let line = bus.monitoredVehicleJourneyLineRef;
        let temp = fetch(`${process.env.REACT_APP_BACKEND_URL}/data/lineInfo/${line}`)
        temp.then(data => {
          data.json().then(data => {
            cachedLineInfo[bus.monitoredVehicleJourneyLineRef] = data
            setCachedLineInfo(cachedLineInfo)
          });
        });
      }
      return "...";
    } catch (error) {
      console.log("No line data for bus", index, "Number of buses", busData.length)
      return "";
    }
  }
  const getBearing = (index: number) => {
    try {
      return busData[index].monitoredVehicleJourneyBearing;
    } catch (error) {
      console.log("No bearing data for bus", index, "Number of buses", busData.length)
      return 0;
      // alert(`No bearing data for bus ${index}`)
    }
  }

  return (
    <>
      {polyline.length !== 0 ? <Polyline positions={polyline} /> : <></>}
      {position.length !== 0 ? <>
        {busData ? <>
          {position.map((pos, index) => {
            return (
              // <Marker eventHandlers={{ click: () => markerOnClick(index) }} key={index} position={pos} icon={new Icon({ iconUrl: './test.png', iconSize: [32, 32] })}>
              <Marker eventHandlers={{ click: () => markerOnClick(index), popupclose: () => setPolyline([]) }} key={index} position={pos} icon={getCustomIcon(getBearing(index), getLineNumber(index))}>
                <Popup>{text} : {busData[index]?.monitoredVehicleJourneyMonitoredCallDestinationDisplay}</Popup>
              </Marker>
            )

          })}
        </> : <></>}
      </> : <></>}


      {/* {position.map((pos, index) => {
        return (
          <Marker key={index} position={pos} icon={new Icon({ iconUrl: markerIconPng, iconAnchor: [12, 41] })}>
            <Popup>You are here</Popup>
          </Marker>
        )

      })} */}
    </>
    // <Marker position={position} icon={new Icon({iconUrl: markerIconPng, iconAnchor: [12, 41]})}>
    //   <Popup>You are here</Popup>
    // </Marker>
  )
}

export default MapComponent;
