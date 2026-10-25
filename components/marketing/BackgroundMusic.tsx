"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const preferenceKey = "sylp-background-music";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.25;
    let enabled = true;
    try { enabled = localStorage.getItem(preferenceKey) !== "off"; } catch {}

    // Start within a real user gesture so mobile autoplay policies are respected.
    const start = (event: Event) => {
      if (!enabled || controlRef.current?.contains(event.target as Node)) return;
      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
      void audio.play().catch(() => { /* The music button remains available. */ });
    };
    const onPlay = () => {
      setPlaying(true);
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
    };
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    document.addEventListener("click", start);
    document.addEventListener("keydown", start);
    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const enable = audio.paused;
    try { localStorage.setItem(preferenceKey, enable ? "on" : "off"); } catch {}
    if (enable) {
      audio.volume = 0.25;
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/sylp-background.mp3" loop preload="none" />
      <button
        ref={controlRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? "Turn background music off" : "Play background music"}
        aria-pressed={playing}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-40 flex min-h-11 items-center gap-2 rounded-full border border-ink/20 bg-cream px-4 py-2 text-sm font-semibold text-ink shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {playing ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        Music {playing ? "on" : "off"}
      </button>
    </>
  );
}
