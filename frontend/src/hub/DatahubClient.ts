import * as signalR from "@microsoft/signalr";
import { Message } from "../components/ChatComponent";
const URL = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:5143"; //or whatever your backend port is
class Connector {
    private connection: signalR.HubConnection;
    public events: (onMessageReceived: (chatMessages: Message[]) => void, onDataReceived: (data: any) => void, onCallFunction: (toolCall: any) => void) => void;
    static instance: Connector;
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(URL + "/hub")
            .withAutomaticReconnect()
            .build();
        this.connection.start().catch(err => document.write(err));
        this.events = (onMessageReceived, onDataReceived, onCallFunction) => {
            this.connection.on("messageReceived", (messages) => {
                onMessageReceived(messages);
            });
            this.connection.on("dataReceived", (data) => {
                onDataReceived(data);
            });
            this.connection.on("callFunction", (chatMessages: any[]) => {
                onCallFunction(chatMessages);
            });
        };
    }
    public sendNewMessage = (messages: Message[], tools: any[]) => {
        this.connection.send("newMessage", messages, tools)
    }
    public static getInstance(): Connector {
        if (!Connector.instance)
            Connector.instance = new Connector();
        return Connector.instance;
    }
}
export default Connector.getInstance;