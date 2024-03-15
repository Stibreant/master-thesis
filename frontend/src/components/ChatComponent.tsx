import { useState } from "react";

type Message = {
    username: string;
    content: string;
}

const ChatComponent = () => {
    const [messages, setMessages] = useState<Message[]>([
        {username: "bot", content: "Welcome to the chat"},
        {username: "user", content: "Thank you"},
        {username: "bot", content: "Please ask me anything!"},
    ]);

    const [newMessage, setNewMessage] = useState<Message>();

    const MessageFromAI = (message: Message) => {
        return message.username === "bot";
    }

    const sendMessage = () => {
        if (!newMessage || newMessage.content === "") return;
        setMessages([...messages, newMessage]);
        setNewMessage({username: "user", content: ""});
    }

    return (
        <div style={{width: "50%", maxHeight: "100vh"}}>
            <div className="chatbox">
                {messages.map((message: any, index: number) => {
                    return (
                        <div className={`messagebox ${MessageFromAI(message) ? '' : 'user-message'}`} key={index}>
                            <span>{message.content}</span>
                        </div>
                    )
                })}
            </div>
            <div className="chat-input-box">
                <textarea placeholder="Type a message..." 
                
                onKeyDown={e => {
                    if (e.key === "Enter"  && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage()
                    }
                }
                }
                onChange={e => setNewMessage({username: "user", content: e.target.value})} 
                value={newMessage?.content}/>
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
        
    )
}

export default ChatComponent;