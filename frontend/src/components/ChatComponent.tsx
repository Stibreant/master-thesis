import { useEffect, useState } from "react";
import Connector from '../hub/DatahubClient'
import Markdown from "react-markdown";
import rehypeHighlight from 'rehype-highlight'
// import "highlight.js/styles/github.css";
import 'highlight.js/styles/github-dark.css';
import filterDataSpec from "../functions/filterData";
import heatDataSpec from "../functions/heatData";

export type Message = {
    role: string;
    content: string;
}

const ChatComponent = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<Message>();
    const { sendNewMessage, events } = Connector();
    useEffect(() => {
        events((message) => {
            let allMessages = [...messages, { role: "assistant", content: message }]
            setMessages(allMessages)
        }, (_) => { return }, (name, args) => {
            if (name === "heatData" || name === "filterData") {
                args = JSON.parse(args);
                let allMessages = [...messages, { role: "assistant", content: `${args.description}` }]
                setMessages(allMessages)
            }
         });
    }, [messages]);

    const MessageFromAI = (message: Message) => {
        return message.role === "assistant";
    }

    const sendMessage = () => {
        if (!newMessage || newMessage.content === "") return;
        var allmessages = messages.concat(newMessage);
        setMessages(allmessages);
        setNewMessage({ role: "user", content: "" });
        let tools = [filterDataSpec, heatDataSpec]
        sendNewMessage(allmessages, tools);
    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="chatbox">
                {messages.map((message: any, index: number) => {
                    return (
                        <div className={`messagebox ${MessageFromAI(message) ? '' : 'user-message'}`} key={index}>
                            <div style={{ whiteSpace: 'pre-wrap' }}><Markdown className="markdown" rehypePlugins={[rehypeHighlight]}>{message.content}</Markdown></div>
                        </div>
                    )
                })}
            </div>
            <div className="chat-input-box">
                <textarea placeholder="Type a message..."

                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }
                    }
                    onChange={e => setNewMessage({ role: "user", content: e.target.value })}
                    value={newMessage?.content} />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>

    )
}

export default ChatComponent;