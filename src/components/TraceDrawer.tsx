import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Hospital } from "@/lib/mock";
import { haptic } from "@/lib/haptics";

interface Props {
  hospital: Hospital | null;
  onClose: () => void;
}

const validatorMeta = {
  pass: { Icon: ShieldCheck, cls: "text-trust-high" },
  warn: { Icon: ShieldAlert, cls: "text-trust-mid" },
  fail: { Icon: ShieldX, cls: "text-trust-low" },
} as const;

export const TraceDrawer = ({ hospital, onClose }: Props) => (
  <AnimatePresence>
    {hospital && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            haptic("tap");
            onClose();
          }}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        />
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 240, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl bg-card border-l border-border shadow-elevated flex flex-col"
        >
          <header className="flex items-start justify-between p-4 sm:p-6 border-b border-border/60">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-primary font-mono-tech">
                Verification Trace
              </p>
              <h2 className="mt-1 text-base sm:text-lg font-semibold truncate">{hospital.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{hospital.location} · PIN {hospital.pin}</p>
            </div>
            <button
              onClick={() => {
                haptic("tap");
                onClose();
              }}
              className="rounded-lg p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition shrink-0"
              aria-label="Close trace"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Stat
                label="Trust Score"
                value={`${(hospital.trust_score * 100).toFixed(0)}% ±${(hospital.trust_interval * 100).toFixed(0)}`}
              />
              <Stat label="Sources" value={String((hospital.trace.sources as string[] | undefined)?.length ?? 0)} />
              <Stat label="Verifications" value={String(hospital.trace.verification_passes ?? 0)} />
              <Stat label="Latency" value={`${hospital.trace.latency_ms ?? 0} ms`} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-mono-tech">
                Validator Agent
              </p>
              <ul className="space-y-2">
                {hospital.validator.map((v, i) => {
                  const m = validatorMeta[v.outcome];
                  const Icon = m.Icon;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs"
                    >
                      <Icon className={`size-4 mt-0.5 shrink-0 ${m.cls}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground/90 leading-snug">{v.rule}</p>
                        <p className="text-muted-foreground mt-0.5 leading-snug">{v.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-mono-tech">
                Raw Trace
              </p>
              <div className="rounded-xl overflow-hidden border border-border/60 text-xs">
                <SyntaxHighlighter
                  language="json"
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    background: "hsl(var(--background))",
                    padding: "1rem",
                    fontSize: "0.7rem",
                  }}
                  wrapLongLines
                >
                  {JSON.stringify(hospital.trace, null, 2)}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/40 border border-border/60 p-3">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech">{label}</p>
    <p className="mt-1 text-sm sm:text-lg font-semibold font-mono-tech text-primary break-all">{value}</p>
  </div>
);
