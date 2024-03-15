import * as signalR from "@microsoft/signalr";
const URL = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:5143"; //or whatever your backend port is
class Connector {
    private connection: signalR.HubConnection;
    public events: (onMessageReceived: (username: string, message: string) => void, onDataReceived: (data: any) => void) => void;
    static instance: Connector;
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(URL + "/hub")
            .withAutomaticReconnect()
            .build();
        this.connection.start().catch(err => document.write(err));
        this.events = (onMessageReceived, onDataReceived) => {
            this.connection.on("messageReceived", (username, message) => {
                onMessageReceived(username, message);
            });
            this.connection.on("dataReceived", (data) => {
                onDataReceived(data);
            });
        };
    }
    public newMessage = (message: string) => {
        this.connection.send("newMessage", "foo", message).then(x => console.log("sent"))
    }
    public static getInstance(): Connector {
        if (!Connector.instance)
            Connector.instance = new Connector();
        return Connector.instance;
    }
}
export default Connector.getInstance;