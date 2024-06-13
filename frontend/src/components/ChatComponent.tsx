import { useEffect, useState } from "react";
import Connector from '../hub/DatahubClient'
import Markdown from "react-markdown";
import rehypeHighlight from 'rehype-highlight'
// import "highlight.js/styles/github.css";
import 'highlight.js/styles/github-dark.css';
import filterDataSpec from "../functions/filterData";
import heatDataSpec from "../functions/heatData";
import QueryDataSpec from "../functions/queryData";

const tools = [filterDataSpec, heatDataSpec, QueryDataSpec];

export type Message = {
    role: string;
    content: string;
    tool_call_id?: string;
    name?: string;
}

const ChatComponent = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<Message>();
    const { sendNewMessage, events } = Connector();

    useEffect(() => {
        events((chatMessages) => {
            setMessages(chatMessages)
        },
            (_) => { return },
            (chatMessages) => {
                let toolCall = chatMessages[chatMessages.length - 1].tool_calls[0];
                let toolFunction = toolCall.function;
                if (toolFunction.name === "heatData" || toolFunction.name === "filterData") {
                    let args = JSON.parse(toolFunction.arguments);
                    chatMessages[chatMessages.length - 1].content = args.description;
                    setMessages([...chatMessages, { role: "tool", content: ``, tool_call_id: toolCall.id, name: `${toolFunction.name}` }])
                }
                else if (toolFunction.name === "QueryData") {
                    let args = JSON.parse(toolFunction.arguments);
                    chatMessages[chatMessages.length - 1].content = args.description;
                    setMessages(chatMessages)
                    queryData(args.sqlQuery, chatMessages).then(([data, allmessages]) => {
                        let allMessages = [
                            ...allmessages,
                            { role: "tool", content: `Result from the Query: ${JSON.stringify(data)}`, tool_call_id: toolCall.id, name: `${toolFunction.name}` }
                        ]
                        setMessages(allMessages);
                        sendNewMessage(allMessages, tools);
                    })
                }
            });
    }, []);

    const MessageFromUser = (message: Message) => {
        return message.role === "user";
    }

    const queryData = async (query: string, allmessages: Message[]) => {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/Data/Query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: `"${query}"`
        });
        let data = await response.json();
        return [data, allmessages];
    }

    const sendMessage = () => {
        if (!newMessage || newMessage.content === "") return;
        var allmessages = messages.concat(newMessage);
        setMessages(allmessages);
        setNewMessage({ role: "user", content: "" });
        sendNewMessage(allmessages, tools);
    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="chatbox">
                {messages.map((message: any, index: number) => {
                    if (message.role === "tool" || message.content === "" || message.content === undefined) return null;
                    return (
                        <div className={`messagebox ${MessageFromUser(message) ? 'user-message' : ''}`} key={index}>
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