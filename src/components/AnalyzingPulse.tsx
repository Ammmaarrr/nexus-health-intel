import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  /** Total records being analyzed. */
  target?: number;
  /** Compact variant fits inside buttons/inline contexts. */
  variant?: "panel" | "inline";
  className?: string;
}

/**
 * Shared "Analyzing record N of M…" indicator. Drives a single, consistent
 * counter style across every loading surface (skeleton results, search button,
 * future loading states).
 */
export const AnalyzingPulse = ({ target = 10000, variant = "panel", className }: Props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) =>
        c < target ? Math.min(target, c + Math.floor(Math.random() * 180) + 40) : target,
      );
    }, 80);
    return () => clearInterval(id);
  }, [target]);

  const pct = ((count / target) * 100).toFixed(0);

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-2 font-mono-tech text-xs", className)}>
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
        <span>
          {count.toLocaleString()}
          <span className="opacity-60">/{target.toLocaleString()}</span>
        </span>
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center justify-between rounded-xl bg-card/60 border border-border/60 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm text-muted-foreground">
          Analyzing record{" "}
          <span className="font-mono-tech text-primary">{count.toLocaleString()}</span> of{" "}
          <span className="font-mono-tech">{target.toLocaleString()}</span>…
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech">
        {pct}%
      </span>
    </motion.div>
  );
};