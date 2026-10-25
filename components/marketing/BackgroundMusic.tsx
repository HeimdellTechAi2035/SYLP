"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const enabledRef = useRef(true);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.25;
    audio.muted = false;

    // Start within a real user gesture so mobile autoplay policies are respected.
    const start = (event: Event) => {
      if (!enabledRef.current || controlRef.current?.contains(event.target as Node)) return;
      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
      void audio.play().catch(() => { /* The music button remains available. */ });
    };
    const onPlay = () => {
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    document.addEventListener("pointerup", start, true);
    document.addEventListener("touchend", start, true);
    document.addEventListener("click", start, true);
    document.addEventListener("keydown", start);
    // Attempt audible playback immediately; retry on interaction if blocked.
    void audio.play().catch(() => {});
    return () => {
      document.removeEventListener("pointerup", start, true);
      document.removeEventListener("touchend", start, true);
      document.removeEventListener("click", start, true);
      document.removeEventListener("keydown", start);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // A blocked autoplay attempt is not playing: the first tap must start it.
    const enable = audio.paused || audio.muted;
    enabledRef.current = enable;
    setEnabled(enable);
    if (enable) {
      audio.muted = false;
      audio.volume = 0.25;
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/sylp-background.mp3" loop preload="auto" />
      <button
        ref={controlRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mute background music" : "Play background music"}
        title={enabled && !playing ? "Music enabled — starts after interaction if your browser blocks autoplay" : undefined}
        aria-pressed={playing}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-40 flex min-h-11 items-center gap-2 rounded-full border border-ink/20 bg-cream px-4 py-2 text-sm font-semibold text-ink shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {playing ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
        {playing ? "Mute music" : enabled ? "Play music" : "Unmute music"}
      </button>
    </>
  );
}
