import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const word = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 110, damping: 16 },
  },
};

export const AnimatedTitle = ({ text, className = "" }: { text: string; className?: string }) => (
  <motion.h1
    variants={container}
    initial="hidden"
    animate="show"
    className={className}
    aria-label={text}
  >
    {text.split(" ").map((w, i) => (
      <motion.span
        key={i}
        variants={word}
        className="inline-block mr-[0.25em] last:mr-0"
      >
        {w}
      </motion.span>
    ))}
  </motion.h1>
);