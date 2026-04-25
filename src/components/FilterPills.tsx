import { motion } from "framer-motion";

export type FilterKey = "all" | "high" | "rural" | "deserts";

const OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Results" },
  { key: "high", label: "High Trust" },
  { key: "rural", label: "Rural Only" },
  { key: "deserts", label: "Specialized Deserts" },
];

interface Props {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}

export const FilterPills = ({ active, onChange }: Props) => (
  <div className="relative inline-flex flex-wrap p-1 rounded-2xl sm:rounded-full bg-card border border-border/60 gap-1 sm:gap-0 max-w-full">
    {OPTIONS.map((opt) => {
      const isActive = active === opt.key;
      return (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`relative z-10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
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