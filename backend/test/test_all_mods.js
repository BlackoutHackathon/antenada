const { exec } = require('child_process');

const tests = [
  'test_locations.js',
  'test_agenda.js',
  'test_security.js'
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    exec(`node test/${test}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar ${test}:`, stderr);
        reject(error);
      } else {
        console.log(`Resultado de ${test}:`, stdout);
        resolve();
      }
    });
  });
}

async function runAllTests() {
  for (const test of tests) {
    console.log(`Iniciando teste ${test}`);
    try {
      await runTest(test);
      console.log(`Teste ${test} concluído com sucesso.`);
    } catch (error) {
      console.error(`Teste ${test} falhou.`);
    }
  }
}

runAllTests();
