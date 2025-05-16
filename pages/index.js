import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ChatbotWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi 👋 I'm your Thryve AI Chatbot. Ask me anything about credit repair! 💳",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // State for lead capture form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [collectingInfo, setCollectingInfo] = useState(false);
    const [infoCollected, setInfoCollected] = useState(false);

    const toggleChat = () => setOpen(!open);

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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        role: 'error',
                        content: "Sorry, I encountered an error while processing your request.",
                    },
                ]);
            } else {
                const data = await response.json();
                setMessages([
                    ...newMessages,
                    { role: 'assistant', content: data.reply || "Sorry, I didn't catch that. Can you try again?" },
                ]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: 'error',
                    content: "Sorry, I encountered an error while processing your request.",
                },
            ]);
        } finally {
            setLoading(false);
        }

        // Start collecting info after the first message
        if (!collectingInfo && !infoCollected) {
            setCollectingInfo(true);
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: 'assistant',
                    content: "Before we continue, please provide your name and email to get your free download.",
                },
            ]);
        }
    };

    const handleInfoSubmit = async () => {
        if (!name || !email) {
            alert('Please provide your name and email.');
            return;
        }

        setMessages(prevMessages => [
            ...prevMessages,
            {
                role: 'assistant',
                content: `Thank you, ${name}! We'll email your copy of 'The Easy and Fast Way to Delete Hard Inquiries' to ${email}. We'll also send you a text message with the download link.`,
            },
        ]);
        setCollectingInfo(false);
        setInfoCollected(true);

        // Your Zapier Webhook URL
        const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/22909312/27596qv/';

        try {
            const response = await fetch(zapierWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone }), // Include phone
            });

            if (!response.ok) {
                console.error('Error sending data to Zapier:', response.status);
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        role: 'assistant',
                        content: "There was an issue processing your request. Please try again later.",
                    },
                ]);
            } else {
                console.log('Data sent to Zapier successfully!');
            }
        } catch (error) {
            console.error('Fetch error when sending to Zapier:', error);
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: 'assistant',
                    content: "There was a connection error. Please try again.",
                },
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {open ? (
                <div style={{ width: '350px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <div style={{ backgroundColor: '#007bff', color: '#fff', padding: '12px', textAlign: 'center', fontWeight: 'bold', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Thryve AI Chat
                        <button onClick={toggleChat} style={{ border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#fff' }}>×</button>
                    </div>
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                                <div style={{
                                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f0f0f0',
                                    borderRadius: '20px',
                                    padding: '10px 18px',
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    wordWrap: 'break-word',
                                    display: 'inline-block',
                                }}>
                                    <strong>{msg.role === 'user' ? 'You:' : 'Thryve AI:'}</strong>
                                    <ReactMarkdown
                                        children={msg.content}
                                        style={{ whiteSpace: "pre-wrap" }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    {collectingInfo && !infoCollected ? (
                        <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="tel"
                                placeholder="Your Phone (Optional)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <button onClick={handleInfoSubmit} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Submit
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '1px solid #ddd' }}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                style={{
                                    padding: '10px 18px',
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    marginLeft: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={toggleChat}
                    style={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}
                >
                    💬 Thryve Chatbot
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
