"use client";

import { useEffect } from "react";
import { unlockSpeech } from "@/lib/speaker";

export default function AudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      unlockSpeech();
      console.log("🔓 Speech unlocked");

      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);

    return () => window.removeEventListener("click", unlock);
  }, []);

  return null;
}
