const axios = require('axios');

const baseUrl = 'http://localhost:3000/locations';

// Função para criar um novo local
async function testCreateLocation() {
  try {
    const response = await axios.post(baseUrl, {
      name: 'Abrigo Esperança',
      address: 'Rua dos Sonhos, 123',
      type: 'Abrigo',
      phone: '1234-5678',
      email: 'contato@abrigoesperanca.com',
      description: 'Abrigo para mulheres em situação de risco.'
    });
    console.log('Local criado:', response.data);
  } catch (error) {
    console.error('Erro ao criar local:', error.response ? error.response.data : error.message);
  }
}

// Função para buscar todos os locais
async function testGetAllLocations() {
  try {
    const response = await axios.get(baseUrl);
    console.log('Locais encontrados:', response.data);
  } catch (error) {
    console.error('Erro ao buscar locais:', error.response ? error.response.data : error.message);
  }
}

// Função para buscar um local específico por ID
async function testGetLocationById(id) {
  try {
    const response = await axios.get(`${baseUrl}/${id}`);
    console.log('Local encontrado:', response.data);
  } catch (error) {
    console.error('Erro ao buscar local:', error.response ? error.response.data : error.message);
  }
}

// Função para atualizar um local
async function testUpdateLocation(id) {
  try {
    const response = await axios.put(`${baseUrl}/${id}`, {
      address: 'Rua Atualizada, 456'
    });
    console.log('Local atualizado:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar local:', error.response ? error.response.data : error.message);
  }
}

// Função para excluir um local
async function testDeleteLocation(id) {
  try {
    const response = await axios.delete(`${baseUrl}/${id}`);
    console.log('Local excluído:', response.data);
  } catch (error) {
    console.error('Erro ao excluir local:', error.response ? error.response.data : error.message);
  }
}

// Função principal para executar os testes
async function runTests() {
  await testCreateLocation();
  await testGetAllLocations();

  // Aqui você precisa obter um ID válido após criar um local
  const testId = 'ID_VALIDO'; // Substitua pelo ID real retornado pela criação

  await testGetLocationById(testId);
  await testUpdateLocation(testId);
  await testDeleteLocation(testId);
}

runTests();
