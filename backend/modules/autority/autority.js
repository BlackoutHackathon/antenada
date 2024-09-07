const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3197;

app.use(bodyParser.json());

// Dados temporários para autoridades
const authorities = [];

// Cadastro de autoridades
app.post('/authorities', (req, res) => {
    const { name, contact } = req.body;
    if (!name || !contact) return res.status(400).send('Name and contact are required');
    authorities.push({ name, contact });
    res.send('Authority added successfully');
});

// Listagem de autoridades
app.get('/authorities', (req, res) => {
    res.json(authorities);
});

app.listen(PORT, () => {
    console.log(`Authorities module running on port ${PORT}`);
});
