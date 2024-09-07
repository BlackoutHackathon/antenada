const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');

const app = express();
const port = 3001;

// Inicializando banco de dados para locais de ajuda
const locationsDb = new Datastore({ filename: 'locations.db', autoload: true });

app.use(bodyParser.json());

// -------------------------------------------------
// CRUD APIs para Locais de Ajuda
// -------------------------------------------------
// Criar novo local de ajuda
app.post('/locations', (req, res) => {
  const location = req.body;
  locationsDb.insert(location, (err, newDoc) => {
    if (err) return res.status(500).send(err);
    res.status(201).json(newDoc);
  });
});

// Buscar todos os locais ou filtrar por pesquisa
app.get('/locations', (req, res) => {
  const { search } = req.query;
  const query = search ? { $text: { $search: search } } : {};
  locationsDb.find(query, (err, docs) => {
    if (err) return res.status(500).send(err);
    res.json(docs);
  });
});

// Buscar um local específico por ID
app.get('/locations/:id', (req, res) => {
  const { id } = req.params;
  locationsDb.findOne({ _id: id }, (err, doc) => {
    if (err) return res.status(500).send(err);
    if (!doc) return res.status(404).send('Local não encontrado.');
    res.json(doc);
  });
});

// Atualizar um local existente
app.put('/locations/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  locationsDb.update({ _id: id }, { $set: updatedData }, {}, (err, numReplaced) => {
    if (err) return res.status(500).send(err);
    res.json({ numReplaced });
  });
});

// Excluir um local
app.delete('/locations/:id', (req, res) => {
  const { id } = req.params;
  locationsDb.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) return res.status(500).send(err);
    res.json({ numRemoved });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
