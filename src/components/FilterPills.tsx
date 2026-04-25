import { motion } from "framer-motion";

export type FilterKey = "all" | "high" | "rural";

const OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Results" },
  { key: "high", label: "High Trust ≥ 0.75" },
  { key: "rural", label: "Rural Only" },
];

interface Props {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}

export const FilterPills = ({ active, onChange }: Props) => (
  <div className="relative inline-flex p-1 rounded-full bg-card border border-border/60">
    {OPTIONS.map((opt) => {
      const isActive = active === opt.key;
      return (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative">{opt.label}</span>
        </button>
      );
    })}
  </div>
);