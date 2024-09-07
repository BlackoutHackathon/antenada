import { useEventsContext } from '@/context/EventsContext'
import { useStateContext } from '@/context/StateContext'
import { IEvents } from '@/core/types'
import { EventTypes } from '@/mocks/dataResouces'
import { useEffect } from 'react'

export const SpeechToText = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//   const { updateEventStorage, removeEventStorage, saveEventStorage } =
//     useEventsContext()
  const { setModal } = useStateContext()
  useEffect(() => {
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`Transcrição: ${transcript}`);

      try {
        const response = await fetch("", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: transcript }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao enviar comando: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Resultado do servidor:", result);

        // Exibir o resultado na tela
        displayResults(result);
      } catch (error) {
        console.error("Erro ao processar a resposta do servidor:", error);
        displayResults({ error: "Erro ao processar o comando" });
      }
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
    };

    function displayResults(result) {
      if (result.error) {
        // setResults([{ error: result.error }]);,ffdcxc
        return;
      }

      if (result && Array.isArray(result)) {
        // setResults(result);
      } else {
        // setResults([{ error: "Erro inesperado ao processar o resultado." }]);
      }
    }
  }, []);

  return (
    <div className="flex w-full justify-center bg-primary p-4">
      <button
          onClick={() => {
            recognition.start();
          }}
          className="create-btn"
        >
          Iniciar Reconhecimento de Voz
        </button>
    </div>
  )
}
