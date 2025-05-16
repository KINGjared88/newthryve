// chat.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!configuration.apiKey) {
        return res.status(500).json({
            error: 'OpenAI API key not configured, please follow instructions in README.md',
        });
    }

    const { messages } = req.body;

    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: 'No messages provided' });
    }

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: messages,
        });
        const reply = completion.data.choices[0].message?.content || '';
        res.status(200).json({ reply });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        if (error.response) {
            res.status(error.response.status).json({ error: `OpenAI API error: ${error.response.data.error.message}` });
        } else {
            res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
    }
}
