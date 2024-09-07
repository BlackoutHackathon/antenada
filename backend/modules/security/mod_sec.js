const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Inicializando banco de dados para configurações de segurança
const securityDb = new Datastore({ filename: 'security.db', autoload: true });

// Inicializando transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

app.use(bodyParser.json());

// -------------------------------------------------
// Configuração de Segurança
// -------------------------------------------------
app.post('/security/:userId', (req, res) => {
  const { userId } = req.params;
  const securitySettings = req.body;
  securityDb.update({ userId }, { $set: securitySettings }, { upsert: true }, (err, numReplaced) => {
    if (err) return res.status(500).send(err);
    res.json({ numReplaced });
  });
});

app.get('/security/:userId', (req, res) => {
  const { userId } = req.params;
  securityDb.findOne({ userId }, (err, doc) => {
    if (err) return res.status(500).send(err);
    if (!doc) return res.status(404).send('Configuração de segurança não encontrada.');
    res.json(doc);
  });
});

// -------------------------------------------------
// Ativação/Desativação de Serviços
// -------------------------------------------------
app.post('/services/:userId/:action', (req, res) => {
  const { userId, action } = req.params;
  const validActions = ['activate', 'deactivate'];
  if (!validActions.includes(action)) return res.status(400).send('Ação inválida.');

  const update = action === 'activate' ? { $set: { 'services.email': true, 'services.sms': true, 'services.phone': true } } : { $set: { 'services.email': false, 'services.sms': false, 'services.phone': false } };

  securityDb.update({ userId }, update, {}, (err, numReplaced) => {
    if (err) return res.status(500).send(err);
    res.json({ numReplaced });
  });
});

// -------------------------------------------------
// Envio de Alertas
// -------------------------------------------------
app.post('/alerts', (req, res) => {
  const { userId, alertMessage } = req.body;

  securityDb.findOne({ userId }, (err, doc) => {
    if (err) return res.status(500).send(err);
    if (!doc) return res.status(404).send('Configuração de segurança não encontrada.');

    const services = doc.services;
    const alertOptions = [];

    if (services.email) {
      alertOptions.push({
        from: 'your-email@gmail.com',
        to: 'recipient-email@example.com',
        subject: 'Alerta de Segurança',
        text: alertMessage
      });
    }

    // Enviar alertas conforme configurado
    alertOptions.forEach((mailOptions) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Erro ao enviar e-mail:', error);
          return res.status(500).send(error);
        }
        console.log('E-mail enviado:', info.response);
      });
    });

    res.status(200).send('Alerta processado.');
  });
});

// -------------------------------------------------
// Integração com Wit.ai para Reconhecimento de Comandos
// -------------------------------------------------
app.post('/wit', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await fetch('https://api.wit.ai/message?q=' + encodeURIComponent(text), {
      headers: { 'Authorization': 'Bearer YOUR_WIT_AI_ACCESS_TOKEN' }
    });
    const data = await response.json();
    
    // Processar o comando de acordo com a intenção retornada pelo Wit.ai
    const intent = data.entities.intent ? data.entities.intent[0].value : '';
    
    switch (intent) {
      case 'search_location':
        await handleSearchLocation(data);
        res.json({ message: 'Busca de localização realizada.' });
        break;
      case 'activate_service':
        await handleServiceActivation(data);
        res.json({ message: 'Serviço ativado com sucesso.' });
        break;
      case 'deactivate_service':
        await handleServiceDeactivation(data);
        res.json({ message: 'Serviço desativado com sucesso.' });
        break;
      default:
        res.json({ message: 'Comando não reconhecido.' });
        break;
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

async function handleSearchLocation(data) {
  const searchQuery = data.entities.search_query ? data.entities.search_query[0].value : '';
  // Execute a busca no banco de dados de locais
  // Implementar a função de busca conforme necessário
}

async function handleServiceActivation(data) {
  const { userId, service } = extractDetailsFromData(data);
  await securityDb.update({ userId }, { $set: { [`services.${service}`]: true } });
}

async function handleServiceDeactivation(data) {
  const { userId, service } = extractDetailsFromData(data);
  await securityDb.update({ userId }, { $set: { [`services.${service}`]: false } });
}

function extractDetailsFromData(data) {
  // Função para extrair detalhes como userId e service do objeto de dados do Wit.ai
  // Ajuste conforme a estrutura da resposta do Wit.ai
  return {
    userId: 'exampleUserId', // Exemplo, substitua conforme necessário
    service: 'email' // Exemplo, substitua conforme necessário
  };
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
