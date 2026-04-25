import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import memeFace from "@/assets/meme-face.png";
import memeSound from "@/assets/sounds/meme.mp3";

const PROMPTS = [
  "BRO YOU CAN DIE 💀",
  "skill issue, you can die 💀",
  "404: cope not found 💀",
  "diagnosis: skull emoji 💀",
  "doctor said: L + ratio + die 💀",
  "loading your funeral... 💀⚰️",
  "bro really searched that 💀💀💀",
  "ICU? more like I-See-U dying 💀",
  "bro thinks he's him 💀",
  "googling your last words rn 💀",
];

type Meme = {
  id: number;
  x: number; // vw
  y: number; // vh
  size: number; // px
  rot: number;
  flip: boolean;
  delay: number;
};

const SWARM_COUNT = 8;

const randomMemes = (): Meme[] =>
  Array.from({ length: SWARM_COUNT }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 85,
    size: 90 + Math.random() * 130,
    rot: -25 + Math.random() * 50,
    flip: Math.random() > 0.5,
    delay: Math.random() * 0.6,
  }));

export const MemeOverlay = ({ triggerKey }: { triggerKey: number }) => {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [visible, setVisible] = useState(false);
  const [swarm, setSwarm] = useState<Meme[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef<number | null>(null);

  // Lazy-init audio element once
  useEffect(() => {
    const a = new Audio(memeSound);
    a.volume = 0.7;
    audioRef.current = a;
    return () => {
      a.pause();
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
  }, []);

  useEffect(() => {
    if (triggerKey === 0) return; // skip initial mount
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setSwarm(randomMemes());
    setVisible(true);

    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
      if (loopRef.current) window.clearInterval(loopRef.current);
      loopRef.current = window.setInterval(() => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }, 1500);
    }
  }, [triggerKey]);

  // Hue cycling background flash
  const flashColors = useMemo(
    () => [
      "hsl(var(--primary) / 0.12)",
      "hsl(0 90% 55% / 0.12)",
      "hsl(60 95% 55% / 0.12)",
      "hsl(280 90% 60% / 0.12)",
    ],
    [],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          {/* Strobe flash background */}
          <motion.div
            animate={{ backgroundColor: flashColors }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          />

          {/* Swarm of memes scattered everywhere */}
          {swarm.map((m) => (
            <motion.img
              key={m.id}
              src={memeFace}
              alt=""
              width={m.size}
              height={m.size}
              loading="lazy"
              initial={{
                opacity: 0,
                scale: 0.2,
                rotate: m.rot - 180,
              }}
              animate={{
                opacity: 1,
                scale: [1, 1.1, 0.95, 1.05, 1],
                rotate: [m.rot, m.rot + 8, m.rot - 8, m.rot],
                y: [0, -12, 0, -8, 0],
              }}
              transition={{
                opacity: { delay: m.delay, duration: 0.3 },
                scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
              }}
              style={{
                position: "absolute",
                left: `${m.x}vw`,
                top: `${m.y}vh`,
                width: m.size,
                height: m.size,
                transform: m.flip ? "scaleX(-1)" : undefined,
                filter: "drop-shadow(0 8px 24px hsl(var(--primary) / 0.5))",
              }}
            />
          ))}

          {/* Center prompt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 40, rotate: -6 }}
            animate={{
              opacity: 1,
              scale: [1, 1.06, 1],
              y: 0,
              rotate: [-2, 2, -2],
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 0.4 },
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[85vw] sm:max-w-md text-center rounded-3xl bg-card border-4 border-primary px-6 py-5 shadow-[0_0_60px_hsl(var(--primary)/0.7)]"
          >
            <p className="text-xl sm:text-3xl font-extrabold text-foreground leading-tight font-mono-tech break-words">
              {prompt}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-primary font-mono-tech">
              press F to pay respects
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};