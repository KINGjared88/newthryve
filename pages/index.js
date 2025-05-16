// pages/index.js
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "👋 Hi! I’m your Thryve AI Chatbot. Ask me anything about credit repair, our services, or how to get started! 💳"
        }
    ]);
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();
            setMessages([...newMessages, { role: "assistant", content: data.reply || "Sorry, I didn't catch that. Try again?" }]);
        } catch (error) {
            setMessages([
                ...newMessages,
                { role: "assistant", content: "⚠️ Error contacting server. Please try again." }
            ]);
        }
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div>
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 9999,
                    fontFamily: "sans-serif"
                }}
            >
                {open ? (
                    <div
                        style={{
                            width: "350px",
                            maxHeight: "500px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            backgroundColor: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden"
                        }}
                    >
                        <div
                            style={{
                                padding: "14px",
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "17px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative"
                            }}
                        >
                            Thryve AI Chatbot
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "8px",
                                    background: "none",
                                    border: "none",
                                    fontSize: "20px",
                                    color: "#fff",
                                    cursor: "pointer"
                                }}
                                aria-label="Close chat"
                            >
                                ×
                            </button>
                        </div>
                        <div style={{
                            flex: 1,
                            padding: "12px 10px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: m.role === "user" ? "#e0eaff" : "#f3fdf6",
                                        color: "#232323",
                                        padding: "10px 16px",
                                        borderRadius: "18px",
                                        margin: "7px 0",
                                        maxWidth: "80%",
                                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                        wordBreak: "break-word",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                                        fontSize: "15px",
                                        fontWeight: 400
                                    }}
                                >
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    style={{ color: "#2563eb", fontWeight: "bold" }}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            )
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            ))}
                            {loading && (
                                <div
                                    style={{
                                        color: "#aaa",
                                        fontStyle: "italic",
                                        margin: "10px",
                                        fontSize: "14px"
                                    }}
                                >
                                    Typing…
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                        <div style={{ display: "flex", borderTop: "1px solid #eee", background: "#fafbfc" }}>
                            <input
                                type="text"
                                placeholder="Type your message…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    border: "none",
                                    fontSize: "15px",
                                    background: "transparent"
                                }}
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                style={{
                                    padding: "0 18px",
                                    backgroundColor: "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    cursor: loading ? "default" : "pointer",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}
                            >
                                {loading ? "…" : "Send"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setOpen(true)}
                        style={{
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            border: "none",
                            padding: "13px 22px",
                            borderRadius: "28px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "15px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
                        }}
                    >
                        💬 Thryve Chatbot
                    </button>
                )}
            </div>
        </div>
    );
}
