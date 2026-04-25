import { useRef, useState } from "react";
import logoMark from "@/assets/logo-mark.png";

// Vande Mataram — public domain recording (Wikimedia Commons)
const VANDE_MATARAM_URL =
  "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bf/Vande_Mataram_-_Instrumental.ogg/Vande_Mataram_-_Instrumental.ogg.mp3";

export const HeartbeatLogo = ({ size = 36 }: { size?: number }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(VANDE_MATARAM_URL);
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Stop Vande Mataram" : "Play Vande Mataram"}
      title={playing ? "Stop Vande Mataram" : "Play Vande Mataram"}
      className="relative inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-transform hover:scale-105 active:scale-95"
      style={{ width: size, height: size }}
    >
      <span
        className={`absolute inset-0 rounded-full bg-primary/20 blur-md ${
          playing ? "animate-pulse-ring" : "opacity-40"
        }`}
      />
      <img
        src={logoMark}
        alt="Healthcare.Intel logo"
        width={size}
        height={size}
        className="relative drop-shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
      />
    </button>
  );
};