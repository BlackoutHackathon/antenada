document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    // Inicialize o calendário apenas depois de garantir que FullCalendar está carregado
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: fetchEvents
    });
    calendar.render();

    function fetchEvents(info, successCallback, failureCallback) {
        fetch('/events')
            .then(response => response.json())
            .then(data => successCallback(data))
            .catch(err => failureCallback(err));
    }
});

function startRecognition() {
    const feedbackEl = document.getElementById('feedback');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR'; // Define o idioma para português brasileiro
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        feedbackEl.textContent = `Você disse: "${text}"`;
        
        fetch('/intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Intent processed:', data);
            feedbackEl.textContent += ' - Comando processado com sucesso';
            updateCalendar(); // Atualiza o calendário com os novos eventos
        })
        .catch(err => {
            console.error('Error processing intent:', err);
            feedbackEl.textContent += ' - Erro ao processar o comando';
        });
    };

    recognition.onerror = function(event) {
        console.error('Erro no reconhecimento de fala', event);
        feedbackEl.textContent = 'Erro ao reconhecer a fala. Tente novamente.';
    };
}

function updateCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = FullCalendar.Calendar.getInstance(calendarEl);
    calendar.refetchEvents(); // Refaz a requisição para obter eventos atualizados
}
