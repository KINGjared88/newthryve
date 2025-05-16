// pages/api/chat.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    if (!configuration.apiKey) {
        return res.status(500).json({
            error: "OpenAI API key not configured, please follow instructions in README.md",
        });
    }

    let { messages } = req.body;

    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided" });
    }

    // Always inject system prompt
    const systemPrompt = {
        role: "system",
        content: `You are the AI assistant for Thryve Credit Solutions, a professional and trusted credit repair company. 
Your job is to assist website visitors by answering their questions clearly, professionally, and confidently—without giving step-by-step coaching or legal advice.

Your tone is friendly, helpful, and knowledgeable. You serve as a virtual concierge—offering information, clarifying options, and directing visitors to the appropriate next step. When helpful, recommend Thryve’s DIY Credit Kit or Done-For-You credit repair service.

Business FAQ:
- Open M-F 8AM–5PM Arizona
- Based in Scottsdale, AZ, serving all 50 states
- No in-person appointments (virtual only)
- Yes, Thryve is licensed and bonded since 2014

Links to use (never invent others):
- DIY Credit Kit: https://thryvecredit.com/dyicreditkit
- Done-For-You Plan: https://thryvecredit.com/thryve-core-plan
- Schedule a time to talk: https://thryvecredit.com/consultation
- Send us a message: https://thryvecredit.com/contact-us
Never output phone numbers or email addresses.
`
    };
    // Do NOT add system prompt if already present, but that's unlikely in your workflow.
    if (messages[0]?.role !== "system") {
        messages = [systemPrompt, ...messages];
    }

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.6,
        });
        const reply = completion.data.choices[0].message?.content || "";
        res.status(200).json({ reply });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        if (error.response) {
            res.status(error.response.status).json({ error: `OpenAI API error: ${error.response.data.error.message}` });
        } else {
            res.status(500).json({ error: "An error occurred while processing your request." });
        }
    }
}
