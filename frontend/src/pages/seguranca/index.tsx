import { Header } from '@/components/Header';
import Meta from '@/layout';
import Main from '@/template';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import io from 'socket.io-client';

const Teste = () => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [transcription, setTranscription] = useState('');

  const sendSocket = io('/send');

  // Inicializa o mapa
  const initMap = () => {
    const mapInstance = L.map('map').setView([0, 0], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);
    setMap(mapInstance);
  };

  // Compartilha localização
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendSocket.emit('location', { latitude, longitude });

          if (marker) {
            marker.setLatLng([latitude, longitude]);
          } else {
            const newMarker = L.marker([latitude, longitude]).addTo(map);
            setMarker(newMarker);
          }

          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Inicia gravação de áudio e reconhecimento de voz
  const handleStartAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = () => {
          sendSocket.emit('audio', reader.result);
        };
        reader.readAsArrayBuffer(audioBlob);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();

      // Inicializa reconhecimento de voz
      if ('webkitSpeechRecognition' in window) {
        const speechRecognition = new webkitSpeechRecognition();
        speechRecognition.lang = 'pt-BR';
        speechRecognition.interimResults = true;
        speechRecognition.continuous = true;

        speechRecognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscription(transcript);
          sendSocket.emit('transcription', transcript);
        };

        speechRecognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        speechRecognition.start();
        setRecognition(speechRecognition);
      } else {
        console.error('Speech recognition is not supported by this browser.');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Para gravação de áudio e reconhecimento de voz
  const handleStopAudio = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (recognition) {
      recognition.stop();
    }
  };

  useEffect(() => {
    initMap();
  }, []);

  return (
    <Main
      meta={<Meta title="antenada" description="Antenada front-end challange" />}
    >
      <main className="flex w-full flex-col bg-primary scrollbar">
        <Header />
        <div className="flex w-full flex-1 flex-row bg-primary">
          <h1>Share Your Location and Audio</h1>
          <div id="map" style={{ height: '400px', width: '100%' }}></div>
          <div id="controls">
            <button onClick={handleShareLocation}>Share Location</button>
            <button onClick={handleStartAudio}>Start Recording</button>
            <button onClick={handleStopAudio}>Stop Recording</button>
          </div>
          <div id="transcription">{transcription}</div>
        </div>
      </main>
    </Main>
  );
};

export default Teste;
