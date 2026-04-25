import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Hospital } from "@/lib/mock";

interface Props {
  hospital: Hospital | null;
  onClose: () => void;
}

export const TraceDrawer = ({ hospital, onClose }: Props) => (
  <AnimatePresence>
    {hospital && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        />
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 240, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-card border-l border-border shadow-elevated flex flex-col"
        >
          <header className="flex items-start justify-between p-6 border-b border-border/60">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-mono-tech">
                Verification Trace
              </p>
              <h2 className="mt-1 text-lg font-semibold">{hospital.name}</h2>
              <p className="text-xs text-muted-foreground">{hospital.location}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              aria-label="Close trace"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Trust Score" value={(hospital.trust_score * 100).toFixed(0) + "%"} />
              <Stat label="Sources" value={String((hospital.trace.sources as string[] | undefined)?.length ?? 0)} />
              <Stat label="Verifications" value={String(hospital.trace.verification_passes ?? 0)} />
              <Stat label="Latency" value={(hospital.trace.latency_ms ?? 0) + " ms"} />
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
                    background: "hsl(222 39% 9%)",
                    padding: "1rem",
                    fontSize: "0.75rem",
                  }}
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
    <p className="mt-1 text-lg font-semibold font-mono-tech text-primary">{value}</p>
  </div>
);