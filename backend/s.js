const express = require('express');
const bodyParser = require('body-parser');
const NeDB = require('nedb');
const { Wit } = require('node-wit');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const db = new NeDB({ filename: 'agenda.db', autoload: true });

const events = [
    {
        title: 'Reunião com nutricionista',
        start: new Date('2024-07-19T09:00:00'),
        description: 'Reunião de alinhamento com a equipe de desenvolvimento.'
    },
    {
        title: 'viagem',
        start: new Date('2024-07-18T12:00:00'),
        description: 'Cancela viagem para Brasília'
    },
    {
        title: 'Reunião de teams',
        start: new Date('2024-07-17T14:00:00'),
        description: 'Reunião de status do projeto com o time de marketing.'
    }
];

db.insert(events, (err, newDocs) => {
    if (err) {
        console.error('Erro ao adicionar eventos:', err);
    } else {
        console.log('Eventos adicionados com sucesso:', newDocs);
    }
});

const WIT_TOKEN = process.env.WIT_TOKEN;
const client = new Wit({ accessToken: WIT_TOKEN });

app.post('/intent', (req, res) => {
    const { text } = req.body;

    client.message(text)
        .then((data) => {
            console.log('Resposta do Wit.ai:', JSON.stringify(data, null, 2));
            handleIntent(data, res);
        })
        .catch((err) => {
            console.error('Erro no Wit.ai:', err);
            res.status(500).send('Erro ao processar o comando');
        });
});

app.get('/events', (req, res) => {
    db.find({}, (err, docs) => {
        if (err) {
            console.error('Erro ao ler eventos:', err);
            res.status(500).send('Erro ao ler eventos');
        } else {
            res.status(200).send(docs);
        }
    });
});

app.get('/events/:id', (req, res) => {
    const { id } = req.params;
    db.findOne({ _id: id }, (err, doc) => {
        if (err) {
            console.error('Erro ao buscar evento por ID:', err);
            res.status(500).send('Erro ao buscar evento');
        } else if (!doc) {
            res.status(404).send('Evento não encontrado');
        } else {
            res.status(200).send(doc);
        }
    });
});

app.get('/events/date/:date', (req, res) => {
    const { date } = req.params;
    db.find({ start: new Date(date) }, (err, docs) => {
        if (err) {
            console.error('Erro ao buscar eventos por data:', err);
            res.status(500).send('Erro ao buscar eventos por data');
        } else {
            res.status(200).send(docs);
        }
    });
});

app.get('/events/keyword/:keyword', (req, res) => {
    const { keyword } = req.params;
    db.find({ description: new RegExp(keyword, 'i') }, (err, docs) => {
        if (err) {
            console.error('Erro ao buscar eventos por palavra-chave:', err);
            res.status(500).send('Erro ao buscar eventos por palavra-chave');
        } else {
            res.status(200).send(docs);
        }
    });
});

app.get('/events/next', (req, res) => {
    db.find({ start: { $gte: new Date() } }).sort({ start: 1 }).limit(1).exec((err, docs) => {
        if (err) {
            console.error('Erro ao buscar próximo evento:', err);
            res.status(500).send('Erro ao buscar próximo evento');
        } else if (docs.length === 0) {
            res.status(404).send('Nenhum evento futuro encontrado');
        } else {
            res.status(200).send(docs[0]);
        }
    });
});

app.post('/events', (req, res) => {
    const event = req.body;
    db.insert(event, (err, newDoc) => {
        if (err) {
            console.error('Erro ao criar evento:', err);
            res.status(500).send('Erro ao criar evento');
        } else {
            res.status(201).send(newDoc);
        }
    });
});

app.put('/events/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    db.update({ _id: id }, { $set: updates }, {}, (err, numReplaced) => {
        if (err) {
            console.error('Erro ao atualizar evento:', err);
            res.status(500).send('Erro ao atualizar evento');
        } else {
            res.status(200).send({ updated: numReplaced });
        }
    });
});

app.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
            console.error('Erro ao deletar evento:', err);
            res.status(500).send('Erro ao deletar evento');
        } else if (numRemoved === 0) {
            res.status(404).send('Evento não encontrado');
        } else {
            res.status(200).send(`Evento removido com sucesso`);
        }
    });
});

function handleIntent(data, res) {
    const intent = data.intents[0]?.name;
    const entities = data.entities || {};
    
    console.log('Intenção detectada:', intent);
    console.log('Entidades:', entities);

    switch (intent) {
        case 'create_event':
            createEvent(entities, res);
            break;
        case 'list_events':
            readEvent(res);
            break;
        case 'update_event':
            updateEvent(entities, res);
            break;
        case 'delete_event':
            deleteEvent(entities, res);
            break;
        case 'search_event':
            searchEvent(entities, res);
            break;
        case 'get_event_by_id':
            getEventById(entities, res);
            break;
        case 'list_events_by_date':
            listEventsByDate(entities, res);
            break;
        case 'list_events_by_keyword':
            listEventsByKeyword(entities, res);
            break;
        case 'event_reminder':
            createReminder(entities, res);
            break;
        case 'get_event_description':
            getEventDescription(entities, res);
            break;
        case 'get_next_event':
            getNextEvent(res);
            break;
        default:
            res.status(400).send('Intenção desconhecida');
    }
}

function createEvent(entities, res) {
    const event = {
        title: entities['wit$contact:contact']?.[0]?.value || 'Evento sem título',
        start: entities['wit$datetime:datetime']?.[0]?.value || new Date(),
        description: entities['wit$description:description']?.[0]?.value || 'Sem descrição'
    };
    db.insert(event, (err, newDoc) => {
        if (err) {
            console.error('Erro ao criar evento:', err);
            res.status(500).send('Erro ao criar evento');
        } else {
            res.status(201).send(newDoc);
        }
    });
}

function readEvent(res) {
    db.find({}, (err, docs) => {
        if (err) {
            console.error('Erro ao ler eventos:', err);
            res.status(500).send('Erro ao ler eventos');
        } else {
            res.status(200).send(docs);
        }
    });
}

function updateEvent(entities, res) {
    const title = entities['wit$contact:contact']?.[0]?.value;
    const newTitle = entities['wit$contact:contact']?.[1]?.value;
    const start = entities['wit$datetime:datetime']?.[0]?.value;

    console.log('Tentando atualizar evento com título:', title);

    if (!title || !newTitle) {
        res.status(400).send('Título do evento ou novo título não fornecido');
        return;
    }

    const updates = {
        title: newTitle,
        start: start || new Date()
    };

    db.update({ title }, { $set: updates }, { multi: true }, (err, numReplaced) => {
        if (err) {
            console.error('Erro ao atualizar evento:', err);
            res.status(500).send('Erro ao atualizar evento');
        } else {
            res.status(200).send({ updated: numReplaced });
        }
    });
}

function deleteEvent(entities, res) {
    const title = entities['wit$search_query:search_query']?.[0]?.value;

    if (!title) {
        res.status(400).send('Título do evento não fornecido');
        return;
    }

    db.remove({ title }, { multi: true }, (err, numRemoved) => {
        if (err) {
            console.error('Erro ao deletar evento:', err);
            res.status(500).send('Erro ao deletar evento');
        } else if (numRemoved === 0) {
            res.status(404).send(`Nenhum evento encontrado com o título "${title}"`);
        } else {
            res.status(200).send(`Evento(s) com título "${title}" removido(s) com sucesso`);
        }
    });
}

function searchEvent(entities, res) {
    const keyword = entities['wit$contact:contact']?.[0]?.value;
    if (!keyword) {
        res.status(400).send('Palavra-chave não fornecida');
        return;
    }

    db.find({ description: new RegExp(keyword, 'i') }, (err, docs) => {
        if (err) {
            console.error('Erro ao buscar eventos por palavra-chave:', err);
            res.status(500).send('Erro ao buscar eventos por palavra-chave');
        } else {
            res.status(200).send(docs);
        }
    });
}

function getEventById(entities, res) {
    const id = entities['wit$contact:contact']?.[0]?.value;
    if (!id) {
        res.status(400).send('ID do evento não fornecido');
        return;
    }

    db.findOne({ _id: id }, (err, doc) => {
        if (err) {
            console.error('Erro ao buscar evento por ID:', err);
            res.status(500).send('Erro ao buscar evento por ID');
        } else if (!doc) {
            res.status(404).send('Evento não encontrado');
        } else {
            res.status(200).send(doc);
        }
    });
}

function listEventsByDate(entities, res) {
    const date = entities['wit$datetime:datetime']?.[0]?.value;
    if (!date) {
        res.status(400).send('Data não fornecida');
        return;
    }

    db.find({ start: new Date(date) }, (err, docs) => {
        if (err) {
            console.error('Erro ao buscar eventos por data:', err);
            res.status(500).send('Erro ao buscar eventos por data');
        } else {
            res.status(200).send(docs);
        }
    });
}

function listEventsByKeyword(entities, res) {
    const keyword = entities['wit$contact:contact']?.[0]?.value;
    if (!keyword) {
        res.status(400).send('Palavra-chave não fornecida');
        return;
    }

    db.find({ description: new RegExp(keyword, 'i') }, (err, docs) => {
        if (err) {
            console.error('Erro ao buscar eventos por palavra-chave:', err);
            res.status(500).send('Erro ao buscar eventos por palavra-chave');
        } else {
            res.status(200).send(docs);
        }
    });
}

function createReminder(entities, res) {
    const title = entities['wit$contact:contact']?.[0]?.value;
    const reminderDate = entities['wit$datetime:datetime']?.[0]?.value;
    if (!title || !reminderDate) {
        res.status(400).send('Título ou data do lembrete não fornecidos');
        return;
    }

    // Lógica para criar um lembrete (simulada aqui)
    res.status(200).send(`Lembrete criado para o evento "${title}" na data ${reminderDate}`);
}

function getEventDescription(entities, res) {
    const title = entities['wit$contact:contact']?.[0]?.value;
    if (!title) {
        res.status(400).send('Título do evento não fornecido');
        return;
    }

    db.findOne({ title }, (err, doc) => {
        if (err) {
            console.error('Erro ao buscar descrição do evento:', err);
            res.status(500).send('Erro ao buscar descrição do evento');
        } else if (!doc) {
            res.status(404).send('Evento não encontrado');
        } else {
            res.status(200).send(doc.description);
        }
    });
}

function getNextEvent(res) {
    db.find({ start: { $gte: new Date() } }).sort({ start: 1 }).limit(1).exec((err, docs) => {
        if (err) {
            console.error('Erro ao buscar próximo evento:', err);
            res.status(500).send('Erro ao buscar próximo evento');
        } else if (docs.length === 0) {
            res.status(404).send('Nenhum evento futuro encontrado');
        } else {
            res.status(200).send(docs[0]);
        }
    });
}

app.listen(3003, () => {
    console.log('Servidor rodando na porta 3003');
});
