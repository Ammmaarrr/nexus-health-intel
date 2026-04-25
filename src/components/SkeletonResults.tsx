import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TARGET = 10000;

export const SkeletonResults = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c < TARGET ? Math.min(TARGET, c + Math.floor(Math.random() * 180) + 40) : TARGET));
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between rounded-xl bg-card/60 border border-border/60 px-4 py-3 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm text-muted-foreground">
            Analyzing record{" "}
            <span className="font-mono-tech text-primary">{count.toLocaleString()}</span> of{" "}
            <span className="font-mono-tech">10,000</span>…
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech">
          {((count / TARGET) * 100).toFixed(0)}%
        </span>
      </motion.div>

      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-card border border-border/60 p-6 overflow-hidden relative"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-2/3 rounded shimmer" />
              <div className="h-4 w-1/3 rounded shimmer" />
            </div>
            <div className="size-20 rounded-full shimmer" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-6 w-20 rounded-full shimmer" />
            ))}
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full rounded shimmer" />
            <div className="h-3 w-5/6 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};