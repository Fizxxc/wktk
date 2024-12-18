import { useEffect, useState } from 'react';

export default function Home() {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/api/ws');
    socket.onopen = () => setConnected(true);
    socket.onmessage = (event) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = new Uint8Array(event.data).buffer;
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    };
    setWs(socket);

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setMediaStream(stream);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (ws && connected) {
            ws.send(event.data);
          }
        };
        mediaRecorder.start(250); // Send chunks of audio every 250ms
      })
      .catch((err) => console.error('Error accessing microphone', err));
  };

  const stopRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  return (
    <div>
      <h1>Walkie-Talkie</h1>
      <button onClick={startRecording} disabled={!connected}>Start Talking</button>
      <button onClick={stopRecording} disabled={!mediaStream}>Stop Talking</button>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
