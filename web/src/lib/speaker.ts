let isUnlocked = false;

export function unlockSpeech() {
  isUnlocked = true;
  speechSynthesis.resume();
}

export function speakText(text: string) {
  if (!isUnlocked) {
    console.warn("Speech blocked: not unlocked");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => console.log("▶️ started");
  utterance.onend = () => console.log("⏹️ ended");
  utterance.onerror = (e) => console.error("❌ error", e);

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
