import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import memeFace from "@/assets/meme-face.png";

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

  useEffect(() => {
    if (triggerKey === 0) return; // skip initial mount
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [triggerKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 60, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 40, rotate: 8 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 pointer-events-none flex items-end gap-3"
        >
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="relative mb-4 max-w-[220px] rounded-2xl rounded-br-sm bg-card border-2 border-primary/60 px-4 py-3 shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          >
            <p className="text-sm font-bold text-foreground leading-tight font-mono-tech">
              {prompt}
            </p>
            {/* Bubble tail */}
            <span className="absolute -right-2 bottom-3 size-3 rotate-45 bg-card border-r-2 border-b-2 border-primary/60" />
          </motion.div>

          {/* Meme face with shake */}
          <motion.img
            src={memeFace}
            alt="meme reaction"
            width={120}
            height={120}
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
            className="size-24 sm:size-32 drop-shadow-[0_8px_24px_hsl(var(--primary)/0.5)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};