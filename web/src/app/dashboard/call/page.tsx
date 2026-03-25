"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [persona, setPersona] = useState<any>(null);
  
  const [time, setTime] = useState(0);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCcon, setIsCcon] = useState(true);
  const [subtitles, setSubtitles] = useState("Connecting...");
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Load persona from session storage (populated from dashboard/explore before navigation)
    const cachedPersona = sessionStorage.getItem('activePersona');
    if (cachedPersona) {
      setPersona(JSON.parse(cachedPersona));
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const playNextAudio = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioBuffer = audioQueueRef.current.shift();
      if (!audioBuffer) {
        isPlayingRef.current = false;
        return;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };

      source.start();
    } catch (err) {
      console.error("Error playing audio", err);
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSubtitles("Error: No session ID provided");
      return;
    }

    const initWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:3001/api/ws/conversation/${sessionId}`);
      
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        setSubtitles("Tap mic to start speaking");
      };

      socket.onmessage = async (event) => {
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "stt_result") {
              setSubtitles(`You: ${data.text}`);
            } else if (data.event === "ai_text_chunk") {
              setSubtitles((prev) => prev.startsWith("AI:") ? prev + data.text : `AI: ${data.text}`);
            } else if (data.event === "ai_text_done") {
            } else if (data.event === "tts_done") {
            }
          } catch (e) {}
        } else if (event.data instanceof ArrayBuffer) {
          try {
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioBuffer = await audioContextRef.current.decodeAudioData(event.data);
            audioQueueRef.current.push(audioBuffer);
            playNextAudio();
          } catch (e) {
            console.error("Failed to decode audio", e);
          }
        }
      };

      socket.onclose = () => {
        setSubtitles("Connection lost. Reconnecting...");
        setTimeout(initWebSocket, 3000);
      };

      setWs(socket);
    };

    initWebSocket();

    return () => {
      if (ws) {
        ws.onclose = null; // prevent reconnect loop on unmount
        ws.close();
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
      stopRecording();
    };
  }, [playNextAudio, sessionId]);

  const startRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support Speech Recognition. Try Chrome or Safari.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        setIsMicOn(true);
        setSubtitles("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
          
        setSubtitles(`You: ${transcript}`);
        
        if (event.results[0].isFinal && ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: 'stt_result', text: transcript }));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsMicOn(false);
      };

      recognition.onend = () => {
        setIsMicOn(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsMicOn(false);
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEndCall = () => {
    stopRecording();
    if (ws) ws.close();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white overflow-hidden relative flex flex-col items-center justify-between p-6">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-2xl z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a] z-0" />

      <div className="w-full flex justify-between items-center z-10 p-4">
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-md px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          <span className="font-mono text-xl tracking-wider text-[#cbd5f5]">{formatTime(time)}</span>
        </div>
        
        <button className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] backdrop-blur-md px-6 py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.1)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-semibold text-white">About AI</span>
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-breathe" />
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-[rgba(255,255,255,0.1)] overflow-hidden relative shadow-[0_0_40px_rgba(124,58,237,0.3)] bg-[#1e1b4b] flex items-center justify-center">
            {persona?.avatarUrl ? (
              <img 
                src={persona.avatarUrl} 
                alt={persona.name || "AI Avatar"} 
                className="w-full h-full object-cover transition-transform duration-1000 origin-center hover:scale-105"
              />
            ) : persona?.name ? (
              <span className="text-8xl font-bold text-white/50">{persona.name.charAt(0)}</span>
            ) : (
              <span className="text-8xl font-bold text-white/50">AI</span>
            )}
          </div>
        </div>

        {isCcon && subtitles && (
          <div className="mt-12 bg-[rgba(0,0,0,0.5)] backdrop-blur-lg px-8 py-4 rounded-3xl max-w-2xl text-center border border-[rgba(255,255,255,0.05)] shadow-[0_0_20px_rgba(124,58,237,0.15)] animate-fade-in-up">
            <p className="text-xl md:text-2xl font-medium text-white tracking-wide">{subtitles}</p>
          </div>
        )}
      </div>

      <div className="z-10 w-full max-w-lg mb-8">
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 flex items-center justify-center gap-4 sm:gap-6 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
          <button 
            onClick={toggleMic}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_25px_#a78bfa]' : 'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)]'}`}
            title="Toggle Microphone"
          >
            {isMicOn ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            ) : (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#cbd5f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            )}
          </button>

          <button 
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${isCameraOn ? 'bg-[rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)]'}`}
            title="Toggle Camera"
          >
            {isCameraOn ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            ) : (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#cbd5f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            )}
          </button>

          <button 
            onClick={() => setIsCcon(!isCcon)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${isCcon ? 'bg-[rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)]'}`}
            title="Toggle Closed Captions"
          >
            <span className={`font-bold text-lg sm:text-xl ${isCcon ? 'text-white' : 'text-[#cbd5f5]'}`}>CC</span>
          </button>

          <button 
            onClick={handleEndCall}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            title="End Call"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CallScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white flex items-center justify-center">Loading Call...</div>}>
      <CallScreenContent />
    </Suspense>
  );
}
