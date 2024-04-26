import { LatLngExpression } from "leaflet"
import { useEffect, useState } from "react"
import { Marker, Polyline, Popup } from "react-leaflet"
import L from 'leaflet';

const getCustomIcon = (rotationDegree: number, lineNumber: string) => {
    return L.divIcon({
      className: 'rotated-icon',
      html: `<div><span class="marker-icon-text">${lineNumber}</span><img src="./bus.png" class="map-icon-img" style="transform: rotate(${rotationDegree}deg);" /></div>`,
      iconSize: [46, 46]
    });
  };

const BusMarkerComponent = ({ busData }: { busData: any[] }) => {
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
          // console.log("Fetching line info for", bus.monitoredVehicleJourneyLineRef)
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
        // if (showAllData) {
        //   setDisplayedData(busData)
        // }
        // let buses = busData.map((bus: any) => [bus.monitoredVehicleJourneyVehicleLocationLatitude,
        // bus.monitoredVehicleJourneyVehicleLocationLongitude]) as LatLngExpression[];
        // setPosition(buses);
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
          // console.log("Fetching line info for", busData[index].monitoredVehicleJourneyLineRef)
          let bus = busData[index];
          let line = bus.monitoredVehicleJourneyLineRef;
          // let temp = fetch(`${process.env.REACT_APP_BACKEND_URL}/data/lineInfo/${line}`)
          // temp.then(data => {
          //   data.json().then(data => {
          //     cachedLineInfo[bus.monitoredVehicleJourneyLineRef] = data
          //     setCachedLineInfo(cachedLineInfo)
          //   });
          // });
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
          {busData ? <>
            {busData.map((bus, index) => {
              return (
                // <Marker eventHandlers={{ click: () => markerOnClick(index) }} key={index} position={pos} icon={new Icon({ iconUrl: './test.png', iconSize: [32, 32] })}>
                <Marker eventHandlers={{ click: () => markerOnClick(index), popupclose: () => setPolyline([]) }} key={bus.monitoredVehicleJourneyLineRef+bus.monitoredVehicleJourneyVehicleRef} position={[bus.monitoredVehicleJourneyVehicleLocationLatitude,
                  bus.monitoredVehicleJourneyVehicleLocationLongitude] as LatLngExpression} icon={getCustomIcon(getBearing(index), getLineNumber(index))}>
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
export default BusMarkerComponent;  