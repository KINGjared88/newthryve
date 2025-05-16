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
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [collectingInfo, setCollectingInfo] = useState(false);
    const [infoCollected, setInfoCollected] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

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
        setUserMessageCount(userMessageCount + 1);

        try {
            const response = await
