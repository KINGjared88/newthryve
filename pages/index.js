import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// ---- CONFIG ----
const LEAD_MAGNET_CONTENT = `Hey, welcome to Thryve! 👋

Want a free copy of our “24-Hour Inquiry Removal Guide” that shows you how to quickly remove hard inquiries from your credit report—step by step?`;

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/22909312/27596qv/";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: LEAD_MAGNET_CONTENT,
      type: "leadmagnet",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Lead magnet flow
  const [collectingInfo, setCollectingInfo] = useState(false);
  const [infoCollected, setInfoCollected] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Auto-focus input
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add message helper
  const addMessage = (msg) => setMessages((msgs) => [...msgs, msg]);

  // User sends a chat message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        addMessage({
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request.",
        });
      } else {
        const data = await response.json();
        addMessage({
          role: "assistant",
          content: data.reply || "Sorry, I didn't catch that. Can you try again?",
        });
      }
    } catch (error) {
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (open && inputRef.current) inputRef.current.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && !collectingInfo) {
      sendMessage();
    }
  };

  // Lead magnet button actions
  const handleLeadMagnet = (choice) => {
    if (choice === "yes") {
      setCollectingInfo(true);
      addMessage({
        role: "assistant",
        content:
          "Great! Enter your name and email below (phone is optional) and we’ll send your free guide.",
        type: "infoform",
      });
    } else {
      // Mark as declined, let chat continue
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === "leadmagnet"
            ? {
                ...msg,
                content: `${msg.content}\n\n_No problem! Ask me anything about credit repair or our services._`,
              }
            : msg
        )
      );
    }
  };

  // Send info to Zapier
  const handleInfoSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Please provide your name and email.");
      return;
    }
    addMessage({
      role: "assistant",
      content: `Thanks, ${name}! 🎉 Check your email for your free guide. If you included your phone, we’ll text it to you too. What else can I help you with?`,
    });
    setCollectingInfo(false);
    setInfoCollected(true);

    try {
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
    } catch (err) {
      addMessage({
        role: "assistant",
        content:
          "We had trouble sending your info to our system, but you should still receive your guide. If not, let us know!",
      });
    }
  };

  // Markdown tweaks for tighter spacing
  const markdownComponents = {
    strong: ({ node, ...props }) => (
      <strong style={{ fontWeight: "bold" }} {...props} />
    ),
    a: ({ node, ...props }) => (
      <a
        style={{ color: "#007bff", textDecoration: "underline" }}
        {...props}
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    ol: ({ node, ...props }) => (
      <ol style={{ margin: 0, paddingLeft: 18 }} {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul style={{ margin: 0, paddingLeft: 18 }} {...props} />
    ),
    li: ({ node, ...props }) => (
      <li style={{ marginBottom: 2, marginTop: 2 }} {...props} />
    ),
    p: ({ node, ...props }) => (
      <p style={{ margin: "0 0 8px 0" }} {...props} />
    ),
  };

  // ---- THE ACTUAL WIDGET ----
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {open ? (
        <div
          style={{
            width: "350px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "500px",
          }}
        >
          <div
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "12px",
              fontWeight: "bold",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <strong style={{ fontSize: "1.1em" }}>Thryve AI Chat</strong>
            <button
              onClick={() => {
                // Close the parent iframe if embedded
                if (window.parent) {
                  window.parent.postMessage("closeThryveChatbot", "*");
                }
                // Optionally also setOpen(false); if using as a standalone component
              }}
              style={{
                border: "none",
                backgroundColor: "transparent",
                fontSize: "18px",
                cursor: "pointer",
                color: "#fff",
                position: "absolute",
                right: "10px",
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{ flexGrow: 1, overflowY: "auto", padding: "12px" }}
            onClick={() => {
              if (inputRef.current) inputRef.current.focus();
            }}
          >
            {messages.map((msg, index) => {
              // Special rendering for lead magnet
              if (msg.type === "leadmagnet" && !collectingInfo && !infoCollected) {
                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "14px",
                      background: "#f0f0f0",
                      borderRadius: "20px",
                      padding: "14px 18px",
                    }}
                  >
                    <ReactMarkdown
                      children={msg.content}
                      components={markdownComponents}
                    />
                    <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                      <button
                        onClick={() => handleLeadMagnet("yes")}
                        style={{
                          padding: "8px 15px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Yes, send it to me!
                      </button>
                      <button
                        onClick={() => handleLeadMagnet("no")}
                        style={{
                          padding: "8px 15px",
                          backgroundColor: "#888",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        No thanks, just here to chat
                      </button>
                    </div>
                  </div>
                );
              }
              // Show info collection form
              if (
                msg.type === "infoform" &&
                collectingInfo &&
                !infoCollected
              ) {
                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "14px",
                      background: "#f0f0f0",
                      borderRadius: "20px",
                      padding: "14px 18px",
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Your Phone (Optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <button
                        onClick={handleInfoSubmit}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Send Me The Guide
                      </button>
                    </div>
                  </div>
                );
              }
              // Standard messages
              return (
                <div key={index} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      backgroundColor:
                        msg.role === "user"
                          ? "#e6f7ff"
                          : "#f0f0f0",
                      borderRadius: "20px",
                      padding: "10px 18px",
                      alignSelf:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      wordWrap: "break-word",
                      display: "inline-block",
                      lineHeight: "1.3",
                      minHeight: "auto",
                    }}
                  >
                    <ReactMarkdown
                      children={
                        msg.role === "user"
                          ? `**You:** ${msg.content}`
                          : `**Thryve AI:** ${msg.content}`
                      }
                      components={markdownComponents}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {!collectingInfo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderTop: "1px solid #ddd",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  marginLeft: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChatbotWidget;
