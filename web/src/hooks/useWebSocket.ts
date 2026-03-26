import { useState, useEffect } from "react";
import { speakText } from "@/lib/speaker";

const globalSockets: Record<string, WebSocket> = {};

export function useWebSocket(sessionId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [subtitles, setSubtitles] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    // 🔥 reuse existing socket
    if (globalSockets[sessionId]) {
      return;
    }

    const socket = new WebSocket(
      `ws://localhost:3001/api/ws/conversation/${sessionId}`,
    );

    globalSockets[sessionId] = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setSubtitles("Connected.");
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;

      const data = JSON.parse(event.data);

      console.log("WS EVENT:", data.event);

      if (data.event === "stt_result") {
        setSubtitles(`You: ${data.text}`);
      } else if (data.event === "ai_text_chunk") {
        setSubtitles((prev) => prev + data.text);
      } else if (data.event === "ai_text_done") {
        setSubtitles(`AI: ${data.text}`);

        console.log("🔥 SPEAK TRIGGERED:", data.text);

        speakText(data.text);
      }
    };

    socket.onclose = () => {
      delete globalSockets[sessionId];
      setIsConnected(false);
    };

    return () => {
      socket.close();
      delete globalSockets[sessionId];
      speechSynthesis.cancel();
    };
  }, [sessionId]);

  const sendAudio = (blob: Blob) => {
    const socket = globalSockets[sessionId];
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(blob);
    }
  };

  const stopAudio = () => {
    const socket = globalSockets[sessionId];
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event: "stop_audio" }));
    }
  };

  return {
    isConnected,
    subtitles,
    sendAudio,
    stopAudio,
  };
}
