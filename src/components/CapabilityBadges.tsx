import { motion } from "framer-motion";
import { Check, X, HelpCircle } from "lucide-react";
import type { Capability } from "@/lib/mock";

const meta = {
  yes: { icon: Check, cls: "bg-trust-high/15 text-trust-high border-trust-high/30" },
  no: { icon: X, cls: "bg-trust-low/15 text-trust-low border-trust-low/30" },
  uncertain: { icon: HelpCircle, cls: "bg-trust-mid/15 text-trust-mid border-trust-mid/30" },
} as const;

const LABELS: Record<string, string> = {
  icu: "ICU",
  surgery: "Surgery",
  emergency: "Emergency",
  anesthesiology: "Anesthesia",
  obstetrics: "Obstetrics",
  radiology: "Radiology",
  oncology: "Oncology",
  dialysis: "Dialysis",
  trauma: "Trauma",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};
const item = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 380, damping: 18 } },
};

interface Props {
  capabilities: Record<string, Capability>;
}

export const CapabilityBadges = ({ capabilities }: Props) => (
  <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
    {Object.entries(capabilities).map(([k, v]) => {
      const m = meta[v];
      const Icon = m.icon;
      return (
        <motion.span
          key={k}
          variants={item}
          whileHover={{ scale: 1.1, y: -2 }}
          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${m.cls}`}
        >
          <Icon className="size-2.5 sm:size-3" />
          {LABELS[k] ?? k}
        </motion.span>
      );
    })}
  </motion.div>
);