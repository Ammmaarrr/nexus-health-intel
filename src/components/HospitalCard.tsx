import { motion } from "framer-motion";
import { MapPin, AlertTriangle, FileSearch, Info } from "lucide-react";
import type { Hospital } from "@/lib/mock";
import { TrustGauge } from "./TrustGauge";
import { CapabilityBadges } from "./CapabilityBadges";
import { Collapsible } from "./Collapsible";

interface Props {
  hospital: Hospital;
  onOpenTrace: (h: Hospital) => void;
}

const cardVariant = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 18 } },
};

export const HospitalCard = ({ hospital, onOpenTrace }: Props) => (
  <motion.article
    variants={cardVariant}
    whileHover={{ y: -4, boxShadow: "0 20px 60px hsl(169 100% 42% / 0.15)" }}
    transition={{ type: "spring", stiffness: 260, damping: 22 }}
    className="rounded-2xl bg-card border border-border/60 p-6 backdrop-blur-sm"
  >
    {/* Header row */}
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="min-w-0">
        <h3 className="text-xl font-semibold tracking-tight">{hospital.name}</h3>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {hospital.location}
          <span className="mx-1 text-border">•</span>
          <span className="uppercase tracking-wider text-[10px]">{hospital.region}</span>
        </div>
      </div>
      <TrustGauge score={hospital.trust_score} />
    </div>

    {/* Capabilities */}
    <CapabilityBadges capabilities={hospital.capabilities} />

    {/* Flags */}
    {hospital.flags.length > 0 && (
      <div className="mt-5 space-y-2">
        {hospital.flags.map((f, i) => {
          const Icon = f.level === "warning" ? AlertTriangle : Info;
          const tone = f.level === "warning" ? "text-trust-mid bg-trust-mid/10 border-trust-mid/25" : "text-muted-foreground bg-secondary/40 border-border";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 220, damping: 22 }}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${tone}`}
            >
              <Icon className="size-3.5 mt-0.5 shrink-0" />
              <span>{f.text}</span>
            </motion.div>
          );
        })}
      </div>
    )}

    {/* Collapsibles */}
    <div className="mt-5 space-y-2">
      <Collapsible title="Evidence" badge={hospital.evidence.length}>
        <ul className="space-y-3">
          {hospital.evidence.map((e, i) => (
            <li key={i} className="rounded-lg bg-secondary/40 border border-border/60 p-3">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-medium text-foreground/90">{e.source}</span>
                <span className="font-mono-tech text-muted-foreground">{e.date}</span>
              </div>
              <p className="text-xs leading-relaxed">{e.snippet}</p>
            </li>
          ))}
        </ul>
      </Collapsible>
      <Collapsible title="Reasoning">
        <p>{hospital.reasoning}</p>
      </Collapsible>
    </div>

    {/* Footer action */}
    <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono-tech">
        id: {hospital.id}
      </span>
      <button
        onClick={() => onOpenTrace(hospital)}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-glow transition-colors"
      >
        <FileSearch className="size-3.5" />
        View verification trace
      </button>
    </div>
  </motion.article>
);