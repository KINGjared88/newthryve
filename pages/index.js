import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
    const [open, setOpen] = useState(true);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi 👋 I'm your Thryve AI Chatbot. Ask me anything about credit repair! 💳" },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'assistant', content: data.reply || "No response from server." }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'assistant', content: "Error contacting server. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {!open ? (
                <button onClick={() => setOpen(true)} style={styles.openButton}>
                    💬 Thryve Chatbot
                </button>
            ) : (
                <div style={styles.chatWindow}>
                    <div style={styles.header}>
                        Thryve AI Chat
                        <button onClick={() => setOpen(false)} style={styles.closeButton}>×</button>
                    </div>
                    <div style={styles.messageArea}>
                        {messages.map((msg, index) => (
                            <div key={index} style={msg.role === 'user' ? styles.userBubble : styles.assistantBubble}>
                                <strong>{msg.role === 'user' ? 'You:' : 'Thryve AI:'}</strong>
                                <ReactMarkdown style={{ whiteSpace: 'pre-wrap' }} children={msg.content} />
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={styles.input}
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading} style={styles.sendButton}>
                            {loading ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    openButton: { backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' },
    chatWindow: { width: '350px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' },
    header: { backgroundColor: '#007bff', color: '#fff', padding: '12px', textAlign: 'center', fontWeight: 'bold', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeButton: { border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#fff' },
    messageArea: { flexGrow: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column' },
    userBubble: { backgroundColor: '#e6f7ff', color: '#000', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px', alignSelf: 'flex-end', maxWidth: '80%', wordBreak: 'break-word' },
    assistantBubble: { backgroundColor: '#f0f0f0', color: '#000', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px', alignSelf: 'flex-start', maxWidth: '80%', wordBreak: 'break-word' },
    inputArea: { display: 'flex', alignItems: 'center', padding: '10px', borderTop: '1px solid #ddd' },
    input: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #eee', outline: 'none', fontSize: '15px' },
    sendButton: { padding: '10px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold' },
};
