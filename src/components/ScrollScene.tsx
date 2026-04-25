import { motion, useScroll, useTransform } from "framer-motion";
import { DnaHelix } from "./three/DnaHelix";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * Fixed, full-viewport scroll-reactive backdrop:
 *  - 3D DNA helix that rotates + stretches with scroll
 *  - Parallax radial glow that drifts upward
 *  - A horizontal scanline that sweeps based on progress
 * Sits behind all content (pointer-events-none) so the UI stays interactive.
 */
export const ScrollScene = () => {
  const progress = useScrollProgress();
  const { scrollYProgress } = useScroll();

  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const scanY = useTransform(scrollYProgress, [0, 1], ["10vh", "85vh"]);
  const helixOpacity = useTransform(scrollYProgress, [0, 0.05, 0.85, 1], [0.55, 0.9, 0.9, 0.4]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Drifting radial glow */}
      <motion.div
        style={{ y: glowY }}
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 size-[120vmin] rounded-full blur-3xl"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.25)_0%,transparent_60%)]" />
      </motion.div>

      {/* Sweeping scanline */}
      <motion.div
        style={{ y: scanY }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
      />

      {/* DNA helix — anchored to right side on desktop, hidden on small screens */}
      <motion.div
        style={{ opacity: helixOpacity }}
        className="absolute right-[-6vw] top-1/2 -translate-y-1/2 hidden md:block w-[55vw] max-w-[680px] h-[90vh]"
      >
        <DnaHelix progress={progress} className="w-full h-full" />
      </motion.div>

      {/* Mobile: smaller helix bottom-center */}
      <motion.div
        style={{ opacity: helixOpacity }}
        className="absolute md:hidden left-1/2 -translate-x-1/2 bottom-[-15vh] w-[120vw] h-[60vh]"
      >
        <DnaHelix progress={progress} className="w-full h-full" />
      </motion.div>
    </div>
  );
};