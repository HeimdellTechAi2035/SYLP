"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Music2, VolumeX } from "lucide-react";
import { isCommunityPath } from "@/lib/community/config";

export default function BackgroundMusic({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const pathname = usePathname();
  const hidden = pathname.startsWith("/checkout") || isCommunityPath(pathname);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.volume = 0.08;
    if (hidden) { player.pause(); return; }
    let mutedByChoice = false;
    try { mutedByChoice = localStorage.getItem("sylp-music-off") === "yes"; } catch {}
    if (!mutedByChoice) void player.play().catch(() => { /* Tap the music control if autoplay is blocked. */ });
    return () => player.pause();
  }, [src, hidden]);

  async function toggle() {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      try { localStorage.setItem("sylp-music-off", "yes"); } catch {}
    } else {
      player.volume = 0.08;
      try {
        await player.play();
        try { localStorage.removeItem("sylp-music-off"); } catch {}
      } catch { setError(true); }
    }
  }

  return <>
    <audio ref={audio} src={src} loop preload="none" onPlay={() => { setPlaying(true); setError(false); }} onPause={() => setPlaying(false)} onError={() => setError(true)} />
    {!hidden && <button type="button" onClick={toggle} aria-label={error ? "Music unavailable — retry" : playing ? "Turn background music off" : "Play quiet background music"} aria-pressed={playing} title={error ? "Music unavailable" : playing ? "Music off" : "Play music"} className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-blush focus-visible:outline-2 focus-visible:outline-gold">{playing ? <Music2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</button>}
  </>;
}
