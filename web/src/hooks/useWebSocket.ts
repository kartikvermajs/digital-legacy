import { useState, useEffect, useRef, useCallback } from "react";

export function useWebSocket(sessionId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const playNextAudio = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioData = audioQueueRef.current.shift();
      if (!audioData) {
        isPlayingRef.current = false;
        return;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
      audioBuffer.getChannelData(0).set(audioData);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };

      source.start();
    } catch (err) {
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    
    // Hardcoded localhost for development parity as previously written
    const socket = new WebSocket(`ws://localhost:3001/api/ws/conversation/${sessionId}`);
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      setIsConnected(true);
      setSubtitles("Connected.");
    };

    socket.onmessage = async (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "stt_result") {
            setSubtitles(`You: ${data.text}`);
          } else if (data.event === "ai_text_chunk") {
            setSubtitles((prev) => prev.startsWith("AI:") ? prev + data.text : `AI: ${data.text}`);
          }
        } catch (e) {}
      } else if (event.data instanceof ArrayBuffer) {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioData = await audioContextRef.current.decodeAudioData(event.data);
          audioQueueRef.current.push(audioData.getChannelData(0));
          playNextAudio();
        } catch (e) {}
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setSubtitles("Connection lost.");
    };

    wsRef.current = socket;

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, [sessionId, playNextAudio]);

  const sendAudio = (blob: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(blob);
    }
  };

  const stopAudio = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "stop_audio" }));
    }
  };

  return { isConnected, subtitles, sendAudio, stopAudio };
}
