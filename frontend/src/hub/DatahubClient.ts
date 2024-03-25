import * as signalR from "@microsoft/signalr";
import { Message } from "../components/ChatComponent";
const URL = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:5143"; //or whatever your backend port is
class Connector {
    private connection: signalR.HubConnection;
    public events: (onMessageReceived: (messages: string) => void, onDataReceived: (data: any) => void) => void;
    static instance: Connector;
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(URL + "/hub")
            .withAutomaticReconnect()
            .build();
        this.connection.start().catch(err => document.write(err));
        this.events = (onMessageReceived, onDataReceived) => {
            this.connection.on("messageReceived", (messages) => {
                onMessageReceived(messages);
            });
            this.connection.on("dataReceived", (data) => {
                onDataReceived(data);
            });
        };
    }
    public sendNewMessage = (messages: Message[]) => {
        this.connection.send("newMessage", messages)
    }
    public static getInstance(): Connector {
        if (!Connector.instance)
            Connector.instance = new Connector();
        return Connector.instance;
    }
}
export default Connector.getInstance;