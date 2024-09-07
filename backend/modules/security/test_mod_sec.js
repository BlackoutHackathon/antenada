const axios = require('axios');

const baseUrl = 'http://localhost:3000/security';
const servicesUrl = 'http://localhost:3000/services';

// Função para criar/atualizar configurações de segurança
async function testUpdateSecuritySettings(userId) {
  try {
    const response = await axios.post(`${baseUrl}/${userId}`, {
      services: {
        email: true,
        sms: false,
        phone: true
      },
      alertPhrase: 'Segurança Ativada!'
    });
    console.log('Configurações de segurança atualizadas:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar configurações de segurança:', error.response ? error.response.data : error.message);
  }
}

// Função para obter configurações de segurança
async function testGetSecuritySettings(userId) {
  try {
    const response = await axios.get(`${baseUrl}/${userId}`);
    console.log('Configurações de segurança:', response.data);
  } catch (error) {
    console.error('Erro ao obter configurações de segurança:', error.response ? error.response.data : error.message);
  }
}

// Função para ativar serviços
async function testActivateServices(userId) {
  try {
    const response = await axios.post(`${servicesUrl}/${userId}/activate`);
    console.log('Serviços ativados:', response.data);
  } catch (error) {
    console.error('Erro ao ativar serviços:', error.response ? error.response.data : error.message);
  }
}

// Função para desativar serviços
async function testDeactivateServices(userId) {
  try {
    const response = await axios.post(`${servicesUrl}/${userId}/deactivate`);
    console.log('Serviços desativados:', response.data);
  } catch (error) {
    console.error('Erro ao desativar serviços:', error.response ? error.response.data : error.message);
  }
}

// Função principal para executar os testes
async function runTests() {
  const userId = 'testUserId'; // Substitua pelo ID real do usuário

  await testUpdateSecuritySettings(userId);
  await testGetSecuritySettings(userId);
  await testActivateServices(userId);
  await testDeactivateServices(userId);
}

runTests();

