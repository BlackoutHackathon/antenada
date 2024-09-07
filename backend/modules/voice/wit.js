const express = require('express');
const bodyParser = require('body-parser');
const { Wit } = require('witai');
const Sentiment = require('sentiment');
const app = express();
const PORT = 3004;

const witClient = new Wit({ accessToken: 'YOUR_WIT_AI_ACCESS_TOKEN' });
const sentiment = new Sentiment();

app.use(bodyParser.json());

// Processamento de comandos de voz
app.post('/voice/commands', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).send('Message is required');
    
    try {
        const { entities } = await witClient.message(message);
        const analysis = sentiment.analyze(message);
        res.json({ entities, sentiment: analysis });
    } catch (error) {
        res.status(500).send('Error processing voice command');
    }
});

app.listen(PORT, () => {
    console.log(`Voice module running on port ${PORT}`);
});
