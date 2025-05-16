import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ChatbotWidget = () => {
    const [open, setOpen] = useState(true);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi 👋 I'm your Thryve AI Chatbot. Ask me anything about credit repair! 💳",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [collectingInfo, setCollectingInfo] = useState(false);
    const [infoCollected, setInfoCollected] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [offeredLeadMagnet, setOfferedLeadMagnet] = useState(false);

    const toggleChat = () => setOpen(!open);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setUserMessageCount(userMessageCount + 1);

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
            if (open && inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    const offerLeadMagnet = () => {
        setOfferedLeadMagnet(true);
        setMessages(prevMessages => [
            ...prevMessages,
            {
                role: 'assistant',
                content: "👋 Interested in learning the secrets of removing hard inquiries? Click below to get our free guide: 'The Easy & Fast Way to Delete Inquiries'!",
            },
            {
                role: 'leadMagnetOffer',
                content: null,
            }
        ]);
    };

    const handleShowLeadMagnetForm = () => {
        setCollectingInfo(true);
        setOfferedLeadMagnet(false);
        setMessages(prevMessages => prevMessages.map(msg =>
            msg.role === 'leadMagnetOffer' ?
            { role: 'assistant', content: "Great! To get your free guide, please provide your name, email, and phone below:" } :
            msg
        ));
    };

    const handleRejectLeadMagnet = () => {
        setOfferedLeadMagnet(false);
        setMessages(prevMessages => prevMessages.filter(msg => msg.role !== 'leadMagnetOffer'));
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

        const zapierWebhookUrl = 'YOUR_ZAPIER_WEBHOOK_URL'; // Replace with your actual Zapier webhook URL

        try {
            const response = await fetch(zapierWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone }),
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

    useEffect(() => {
        const lastUserMessage = messages.slice(-1)[0]?.content?.toLowerCase();
        const inquiryKeywords = ['inquiry', 'inquiries', 'hard inquiry'];

        if (!offeredLeadMagnet && !collectingInfo && !infoCollected && (userMessageCount >= 3 || (lastUserMessage && inquiryKeywords.some(keyword => lastUserMessage.includes(keyword))))) {
            // Move lead magnet offer directly into the chat
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    role: 'assistant',
                    content: "👋 Interested in learning the secrets of removing hard inquiries? [Yes, tell me more!](#) | [No, thanks.](#)",
                },
            ]);
            setOfferedLeadMagnet(true); // Still set this to avoid multiple offers
        }

        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, userMessageCount, offeredLeadMagnet, collectingInfo, infoCollected]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        }}>
            {open ? (
                <div style={{
                    width: '350px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '500px',
                }}>
                    <div style={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        padding: '12px',
                        fontWeight: 'bold',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                    }}>
                        <strong style={{ fontSize: '1.1em' }}>Thryve AI Chat</strong>
                        <button
                            onClick={toggleChat}
                            style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: '#fff',
                                position: 'absolute',
                                right: '10px',
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                                <div style={{
                                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : (msg.role === 'assistant' || msg.role === 'leadMagnetOffer' ? '#f0f0f0' : '#ffe0b2'),
                                    borderRadius: '20px',
                                    padding: '10px 18px',
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    wordWrap: 'break-word',
                                    display: 'inline-block',
                                    lineHeight: '1.3',
                                    minHeight: 'auto', // Ensure bubbles size to content
                                }}>
                                    <strong>{msg.role === 'user' ? 'You:' : 'Thryve AI:'}</strong>
                                    {msg.role === 'leadMagnetOffer' ? (
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                                            {/* These buttons will likely need custom click handlers within ReactMarkdown */}
                                            <button onClick={handleShowLeadMagnetForm} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                                Yes, tell me more!
                                            </button>
                                            <button onClick={handleRejectLeadMagnet} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                                No, thanks.
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                                            <ReactMarkdown
                                                children={msg.content}
                                                components={{
                                                    strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
                                                    a: ({ node, ...props }) => <a style={{ color: '#007bff', textDecoration: 'underline' }} {...props} />,
                                                }}
                                            />
                                        </div>
                                    )}
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
                                Get Your Free Guide
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '1px solid #ddd' }}>
                            <input
                                ref={inputRef}
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
