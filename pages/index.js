import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ChatbotWidget = () => {
    // ... (rest of your component state and functions remain the same)

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif', // Added font family
        }}>
            {open ? (
                <div style={{ width: '350px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'auto' }}> {/* Adjusted height */}
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
                                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f0f0f0',
                                    borderRadius: '20px',
                                    padding: '10px 18px',
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    wordWrap: 'break-word',
                                    display: 'inline-block',
                                }}>
                                    <strong>{msg.role === 'user' ? 'You:' : 'Thryve AI:'}</strong>
                                    <div style={{ height: 'auto' }}>
                                        <ReactMarkdown
                                            children={msg.content}
                                            style={{ whiteSpace: "pre-wrap" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    {collectingInfo && !infoCollected ? (
                        // ... (lead capture form remains the same)
                    ) : (
                        // ... (input and send button remain the same)
                    )}
                </div>
            ) : (
                // ... (closed chat button remains the same)
            )}
        </div>
    );
};

export default ChatbotWidget;
