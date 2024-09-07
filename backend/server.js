const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve arquivos estáticos
app.use(express.static('public'));

// Namespace para envio de dados
const sendNamespace = io.of('/send');

// Namespace para escuta de dados
const listenNamespace = io.of('/listen');

// Manipulação de eventos de localização, áudio e transcrição no namespace de envio
sendNamespace.on('connection', (socket) => {
    console.log('A client connected to send namespace');

    // Recebe e redistribui a localização
    socket.on('location', (data) => {
        console.log('Received location:', data);
        listenNamespace.emit('location-update', data);
    });

    // Recebe e redistribui o áudio
    socket.on('audio', (data) => {
        console.log('Received audio');
        listenNamespace.emit('audio-update', data);
    });

    // Recebe e redistribui a transcrição
    socket.on('transcription', (data) => {
        console.log('Received transcription:', data);
        listenNamespace.emit('transcription-update', data);
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected from send namespace');
    });
});

// Manipulação de eventos de escuta
listenNamespace.on('connection', (socket) => {
    console.log('A client connected to listen namespace');

    socket.on('disconnect', () => {
        console.log('A client disconnected from listen namespace');
    });
});

server.listen(3197, () => {
    console.log('Server running on port 3197');
});

