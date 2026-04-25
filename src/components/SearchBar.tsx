import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (q: string) => void;
  loading: boolean;
  initial?: string;
}

export const SearchBar = ({ onSubmit, loading, initial = "" }: Props) => {
  const [value, setValue] = useState(initial);
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
            ? "0 0 0 2px hsl(169 100% 42%), 0 0 40px hsl(169 100% 42% / 0.25)"
            : "0 0 0 1px hsl(220 26% 18%), 0 20px 60px hsl(224 60% 2% / 0.4)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative flex items-center gap-3 rounded-2xl bg-card-gradient border border-border/60 px-5 py-4"
      >
        <Search className="size-5 text-primary shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Find ICU-capable hospitals near rural Bihar with surgery & emergency care…"
          className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_hsl(var(--primary)/0.6)]"
        >
          <Sparkles className="size-4 transition-transform group-hover:rotate-12" />
          {loading ? "Analyzing…" : "Investigate"}
        </button>
      </motion.form>
    </div>
  );
};