import { Header } from '@/components/Header';
import Meta from '@/layout';
import Main from '@/template';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import io from 'socket.io-client';
import Aside from '@/components/Aside';

const Teste = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker<any> | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcription, setTranscription] = useState('');
  const [isClient, setIsClient] = useState(false);

  const sendSocket = io('http://127.0.0.1:3197/send');

  // Inicializa o mapa
  const initMap = () => {

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    if (!map) {
      const mapInstance = L.map('map').setView([0, 0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);
      setMap(mapInstance);
    }
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
            const newMarker = L.marker([latitude, longitude]).addTo(map!);
            setMarker(newMarker);
          }

          map?.setView([latitude, longitude], 13);
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
        const speechRecognition =
          new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
        speechRecognition.lang = 'pt-BR';
        speechRecognition.interimResults = true;
        speechRecognition.continuous = true;

        speechRecognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscription(transcript);
          sendSocket.emit('transcription', transcript);
        };

        speechRecognition.onerror = (event: any) => {
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
    // Verifica se está no lado do cliente
    setIsClient(typeof window !== 'undefined');
    if (isClient) {
      initMap();
    }
  }, [isClient]);

  return (
    <Main
      meta={<Meta title="antenada" description="Antenada front-end challange" />}
    >
      <main className="flex w-full flex-col bg-primary scrollbar">
        <Header />
        <section className="flex w-full flex-col items-center xl:flex-row xl:items-start">
          <Aside />
          <div className="w-full py-8">
            <p>Compartilhar sua localização e áudio</p>
            {isClient && <div id="map" style={{ height: '400px', width: '100%', overflow: 'hidden' }}></div>}
            <div className="mt-10 flex">
              <button className="group rounded-lg bg-button py-2 px-4 transition-colors hover:opacity-80 mr-2" onClick={handleShareLocation}>
                <p className="text-eventBtn text-sm font-normal">Compartilhar localização</p>
              </button>
              <button className="group rounded-lg bg-button py-2 px-4 transition-colors hover:opacity-80 mr-2" onClick={handleStartAudio}>
                <p className="text-eventBtn text-sm font-normal">Compartilhar audio</p>
              </button>
              <button className="group rounded-lg bg-button py-2 px-4 transition-colors hover:opacity-80" onClick={handleStopAudio}>
                <p className="text-eventBtn text-sm font-normal">Parar compartilhamento de áudio</p>
              </button>
            </div>
            <div id="transcription">{transcription}</div>
          </div>

        </section>
      </main>
    </Main>
  );
};

export default Teste;
