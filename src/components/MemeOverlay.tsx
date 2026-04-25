import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import memeFace from "@/assets/meme-face.png";
import memeSound from "@/assets/sounds/meme.mp3";

const PROMPTS = [
  "BRO YOU CAN DIE 💀",
  "bro... you can die 💀",
  "searching hospitals? bro you can die 💀",
  "404: hospital not found, bro you can die 💀",
  "loading... but also bro you can die 💀",
];

export const MemeOverlay = ({ triggerKey }: { triggerKey: number }) => {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef<number | null>(null);

  // Lazy-init audio element once
  useEffect(() => {
    const a = new Audio(memeSound);
    a.volume = 0.6;
    audioRef.current = a;
    return () => {
      a.pause();
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
  }, []);

  useEffect(() => {
    if (triggerKey === 0) return; // skip initial mount
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setVisible(true);

    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {
        /* autoplay blocked — ignore */
      });
      // Re-trigger every 2s so the meme keeps screaming while it stays on screen
      if (loopRef.current) window.clearInterval(loopRef.current);
      loopRef.current = window.setInterval(() => {
        a.currentTime = 0;
        a.play().catch(() => {});
      }, 2000);
    }
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 60, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 40, rotate: 8 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center gap-4 sm:gap-6"
        >
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="relative max-w-[260px] sm:max-w-sm rounded-2xl rounded-br-sm bg-card border-2 border-primary/60 px-5 py-4 shadow-[0_0_40px_hsl(var(--primary)/0.5)]"
          >
            <p className="text-base sm:text-lg font-bold text-foreground leading-tight font-mono-tech">
              {prompt}
            </p>
            {/* Bubble tail */}
            <span className="absolute -right-2 bottom-3 size-3 rotate-45 bg-card border-r-2 border-b-2 border-primary/60" />
          </motion.div>

          {/* Meme face with shake */}
          <motion.img
            src={memeFace}
            alt="meme reaction"
            width={256}
            height={256}
            loading="lazy"
            animate={{
              rotate: [0, -4, 4, -3, 3, 0],
              y: [0, -2, 0, -1, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            className="size-40 sm:size-56 md:size-64 drop-shadow-[0_8px_30px_hsl(var(--primary)/0.6)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};