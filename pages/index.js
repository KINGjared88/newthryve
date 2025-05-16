import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() { // Changed to a named function and exported as default
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm your Thryve AI Chatbot. Ask me anything about credit repair! 💳",
    },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(true);
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply || "No response from server." },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error contacting server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      {open ? (
        <div
          style={{
            width: "350px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "500px",
          }}
        >
          <div
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "12px",
              textAlign: "center",
              fontWeight: "bold",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            Thryve AI Chat
          </div>
          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "12px",
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                <strong>{msg.role === "user" ? "You:" : "Thryve AI:"}</strong>
                <ReactMarkdown
                  children={msg.content}
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                outline: "none",
                fontSize: "15px",
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "10px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                borderTopRightRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "12px 18px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
          }}
        >
          💬 Thryve Chatbot
        </button>
      )}
    </div>
  );
}
