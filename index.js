require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Load bot token and chat ID from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Environment variable for Telegram Bot Token
const CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Environment variable for Telegram Chat ID

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in environment variables.');
    process.exit(1); // Exit the app if required environment variables are missing
}

app.post('/api/webhook', async (req, res) => {
    const payload = req.body;

    // Only handle pushes to the "main" branch
    if (payload.ref && payload.ref.includes('refs/heads/main')) {
        const repository = payload.repository?.full_name || 'Unknown Repository';
        const commitMessage = payload.head_commit?.message || 'No commit message';
        const author = payload.head_commit?.author?.name || 'Unknown Author';

        const message = `
🚀 *New Code Pushed to Main Branch*
    -Repository: ${repository}
    -Commit Message: ${commitMessage}
    -Author: ${author}
        `;

        try {
            // Send the message to Telegram
            const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            });
            console.log('Notification sent to Telegram:', response.data);
            res.status(200).send('Notification sent to Telegram');
        } catch (error) {
            console.error('Error sending Telegram notification:', error.message, error.response?.data || '');
            res.status(500).send('Failed to send Telegram notification');
        }
    } else {
        console.log('Not a push to the main branch:', payload.ref);
        res.status(200).send('Not a push to main branch');
    }
});

// Root endpoint for testing
app.get('/', (req, res) => {
    res.send('GitHub to Telegram Webhook is running!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
