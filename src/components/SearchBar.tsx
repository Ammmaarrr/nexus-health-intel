import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AnalyzingPulse } from "./AnalyzingPulse";

interface Props {
  onSubmit: (q: string) => void;
  loading: boolean;
  initial?: string;
  /** Allows external code (suggested-query chips) to drive the input value. */
  value?: string;
  onValueChange?: (v: string) => void;
}

export const SearchBar = ({
  onSubmit,
  loading,
  initial = "",
  value: controlledValue,
  onValueChange,
}: Props) => {
  const [internalValue, setInternalValue] = useState(initial);
  const value = controlledValue ?? internalValue;
  const setValue = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
  };
  const [focused, setFocused] = useState(false);

  const handle = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* radial glow */}
      <div className="pointer-events-none absolute -inset-x-20 -inset-y-16 bg-glow-radial blur-2xl" />

      <motion.form
        onSubmit={handle}
        animate={{
          scale: focused ? 1.02 : 1,
          boxShadow: focused
            ? "0 0 0 2px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.25), 0 0 80px hsl(var(--primary-glow) / 0.18)"
            : "0 0 0 1px hsl(var(--border)), 0 20px 60px hsl(230 70% 2% / 0.4)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative flex items-center gap-2 sm:gap-3 rounded-2xl bg-card-gradient border border-border/60 px-3 sm:px-5 py-3 sm:py-4"
      >
        <Search className="size-4 sm:size-5 text-primary shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Find ICU-capable hospitals in rural Bihar…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)] shrink-0"
        >
          {loading ? (
            <>
              <span className="hidden sm:inline">Analyzing</span>
              <AnalyzingPulse variant="inline" className="text-primary-foreground" />
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 sm:size-4 transition-transform group-hover:rotate-12" />
              <span>Investigate</span>
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};