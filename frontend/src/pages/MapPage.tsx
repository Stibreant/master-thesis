import { useState } from "react";
import ChatComponent from "../components/ChatComponent";
import MapComponent from "../components/MapComponent";
const MapPage = () => {
    const [hideChat, setHideChat] = useState(false);
    return (
        <>
            <MapComponent />
            
            <div className="map-chat-container" style={{display: hideChat? "none": "block"}}>
                <ChatComponent />
            </div>
        </>
    )
}
export default MapPage;