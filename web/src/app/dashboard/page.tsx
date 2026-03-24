"use client";
import { useState, useRef } from 'react';

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            // Buffer to send over WebSockets
            console.log("Audio chunk generated:", e.data.size, "bytes");
          }
        };
        mediaRecorder.current.start(250); // Small chunks
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Failed to access microphone.");
      }
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-slate-900 justify-between items-center py-12 px-6">
      <div className="flex flex-col items-center mt-12">
        <img 
          src="https://via.placeholder.com/150" 
          alt="AI Avatar" 
          className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover animate-breathe"
        />
        <h2 className="text-white text-3xl font-bold mt-8 tracking-tight">AI Companion</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {isRecording ? (
          <div className="h-32 w-full bg-indigo-500/10 rounded-2xl flex flex-col justify-center items-center overflow-hidden border border-indigo-500/20">
             <span className="text-indigo-400 font-semibold mb-4 tracking-widest text-sm uppercase">LISTENING...</span>
             <div className="flex items-end h-10 gap-1.5">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.0s' }}></div>
                <div className="w-1.5 h-10 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }}></div>
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
             </div>
          </div>
        ) : (
          <p className="text-slate-400 font-medium text-center text-lg">Click the mic to start speaking</p>
        )}
      </div>

      <button 
        onClick={toggleRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 text-4xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
        }`}
      >
        🎤
      </button>
    </main>
  );
}
