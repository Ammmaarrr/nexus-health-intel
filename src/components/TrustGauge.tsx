import { motion } from "framer-motion";

interface Props {
  score: number; // 0–1
  size?: number;
  /** Optional ± confidence interval (0..1) shown beneath the score. */
  interval?: number;
}

const colorFor = (s: number) => {
  if (s >= 0.75) return "hsl(var(--trust-high))";
  if (s >= 0.5) return "hsl(var(--trust-mid))";
  return "hsl(var(--trust-low))";
};

export const TrustGauge = ({ score, size = 80, interval }: Props) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;
  const stroke = colorFor(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base sm:text-lg font-semibold font-mono-tech leading-none"
          style={{ color: stroke }}
        >
          {(score * 100).toFixed(0)}
        </motion.span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">trust</span>
        {typeof interval === "number" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-[8px] sm:text-[9px] font-mono-tech text-muted-foreground"
          >
            ±{(interval * 100).toFixed(0)}
          </motion.span>
        )}
      </div>
    </div>
  );
};