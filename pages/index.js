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
