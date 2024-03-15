import { Icon, LatLngExpression } from 'leaflet'
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import 'leaflet/dist/leaflet.css'

import { useEffect, useState } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import Connector from '../hub/DatahubClient'

const MapComponent = () => {
  const [coordinates] = useState<LatLngExpression>([58.93730820230997, 5.697275755646442])
  const [busData, setBusData] = useState<any>([])
  const { events } = Connector();
  useEffect(() => {
    events((_, message) => { return }, (data) => setBusData(data));
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
  // const map = useMapEvents({
  //   click() {
  //     map.locate()
  //   },
  //   locationfound(e) {
  //     setPosition(e.latlng)
  //     map.flyTo(e.latlng, map.getZoom())
  //   },
  // })

  // const map = useMapEvents({
  //   async click() {
  //     let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/data/KOL:ServiceJourney:1033_240111106398057_3002`)
  //     response.json().then(data => {
  //       let x = data.coordinates.map((coord: any) => [coord[1], coord[0]])
  //       setPolyline(x)
  //       // map.flyTo(x[0])
  //       // map.fitBounds([x[0], x[x.length - 1]])
  //       map.flyToBounds([x[0], x[x.length - 1]])
  //       // alert(data)
  //     })
  //     let response2 = await fetch(`${process.env.REACT_APP_BACKEND_URL}/data/latest`)
  //     response2.json().then(data => {
  //       let buses = data.map((bus: any) => [bus.MonitoredVehicleJourneyVehicleLocationLatitude,
  //       bus.MonitoredVehicleJourneyVehicleLocationLongitude])
  //       setData(data);
  //       setPosition(buses);
  //     })
  //   }
  // })

  useEffect(() => {
    if (busData) {
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

  return (
    <>
      {polyline.length !== 0 ? <Polyline positions={polyline} /> : <></>}
      {position.length !== 0 ? <>
        {position.map((pos, index) => {
          return (
            <Marker eventHandlers={{ click: () => markerOnClick(index) }} key={index} position={pos} icon={new Icon({ iconUrl: './test.png', iconSize: [32, 32] })}>
              <Popup>{text} : {busData[index]?.monitoredVehicleJourneyMonitoredCallDestinationDisplay}</Popup>
            </Marker>
          )

        })}
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
