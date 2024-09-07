const axios = require('axios');

const baseUrl = 'http://localhost:3000/events';

// Função para criar um novo evento
async function testCreateEvent() {
  try {
    const response = await axios.post(baseUrl, {
      title: 'Reunião de Equipe',
      description: 'Reunião para discutir os próximos passos do projeto.',
      date: '2024-09-15',
      time: '10:00',
      location: 'Sala de Conferências',
      contact: 'equipe@empresa.com'
    });
    console.log('Evento criado:', response.data);
    return response.data._id;
  } catch (error) {
    console.error('Erro ao criar evento:', error.response ? error.response.data : error.message);
  }
}

// Função para buscar todos os eventos
async function testGetAllEvents() {
  try {
    const response = await axios.get(baseUrl);
    console.log('Eventos encontrados:', response.data);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error.response ? error.response.data : error.message);
  }
}

// Função para buscar um evento específico por ID
async function testGetEventById(id) {
  try {
    const response = await axios.get(`${baseUrl}/${id}`);
    console.log('Evento encontrado:', response.data);
  } catch (error) {
    console.error('Erro ao buscar evento:', error.response ? error.response.data : error.message);
  }
}

// Função para atualizar um evento
async function testUpdateEvent(id) {
  try {
    const response = await axios.put(`${baseUrl}/${id}`, {
      location: 'Sala de Reuniões'
    });
    console.log('Evento atualizado:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error.response ? error.response.data : error.message);
  }
}

// Função para excluir um evento
async function testDeleteEvent(id) {
  try {
    const response = await axios.delete(`${baseUrl}/${id}`);
    console.log('Evento excluído:', response.data);
  } catch (error) {
    console.error('Erro ao excluir evento:', error.response ? error.response.data : error.message);
  }
}

// Função principal para executar os testes
async function runTests() {
  const eventId = await testCreateEvent();
  await testGetAllEvents();
  if (eventId) {
    await testGetEventById(eventId);
    await testUpdateEvent(eventId);
    await testDeleteEvent(eventId);
  }
}

runTests();
