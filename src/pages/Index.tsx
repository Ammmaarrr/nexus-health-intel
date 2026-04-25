import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { LayoutGrid, Map as MapIcon, ShieldCheck, Database } from "lucide-react";
import { HeartbeatLogo } from "@/components/HeartbeatLogo";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { SearchBar } from "@/components/SearchBar";
import { FilterPills, type FilterKey } from "@/components/FilterPills";
import { HospitalCard } from "@/components/HospitalCard";
import { SkeletonResults } from "@/components/SkeletonResults";
import { TraceDrawer } from "@/components/TraceDrawer";
import { MapView } from "@/components/MapView";
import { ScrollScene } from "@/components/ScrollScene";
import { fetchHospitals, SUGGESTED_QUERIES, TOTAL_INDEXED, type Hospital } from "@/lib/mock";
import { haptic } from "@/lib/haptics";

type ViewMode = "list" | "map";

const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const isDesert = (h: Hospital) =>
  h.capabilities.oncology === "no" ||
  h.capabilities.dialysis === "no" ||
  h.capabilities.trauma === "no" ||
  h.capabilities.trauma === "uncertain";

const Index = () => {
  const [results, setResults] = useState<Hospital[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [traceFor, setTraceFor] = useState<Hospital | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async (q: string) => {
    setLoading(true);
    setResults(null);
    setLastQuery(q);
    const data = await fetchHospitals(q);
    setResults(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!results) return [];
    return results.filter((h) => {
      if (filter === "high") return h.trust_score >= 0.75;
      if (filter === "rural") return h.region === "rural";
      if (filter === "deserts") return isDesert(h);
      return true;
    });
  }, [results, filter]);

  return (
    <div className="min-h-screen relative">
      <ScrollScene />

      <div className="relative z-10">
        {/* Top nav strip */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30 bg-background/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <HeartbeatLogo size={26} />
              <span className="text-sm font-semibold tracking-tight truncate">
                Healthcare<span className="text-primary">.</span>Intel
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground font-mono-tech shrink-0">
              <ShieldCheck className="size-3.5 text-primary" />
              <span className="hidden sm:inline">v0.4 · evidence-first</span>
              <span className="sm:hidden">v0.4</span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative pt-10 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedTitle
              text="Trust-scored medical discovery."
              className="text-[26px] sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.15] sm:leading-[1.05] text-balance px-2"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-3 sm:mt-6 max-w-2xl mx-auto text-[13px] sm:text-base md:text-lg text-muted-foreground px-2 leading-relaxed"
            >
              Every claim cross-verified. Every answer scored.
            </motion.p>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-8 sm:mt-10"
          >
            <SearchBar
              onSubmit={handleSearch}
              loading={loading}
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </motion.div>

          {/* Suggested queries */}
          {!results && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-5 max-w-3xl mx-auto"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      haptic("select");
                      setSearchValue(q);
                      handleSearch(q);
                    }}
                    className="text-left text-[11px] sm:text-[13px] px-3 py-2 rounded-full bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 backdrop-blur transition-colors min-h-[36px] leading-snug max-w-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* Results area */}
        <section className="px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Toolbar */}
            {(loading || results) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6"
              >
                <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
                  <FilterPills active={filter} onChange={setFilter} />
                </div>
                <div className="inline-flex p-1 rounded-full bg-card border border-border/60 self-start sm:self-auto">
                  <ViewToggle current={view} setView={setView} mode="list" icon={<LayoutGrid className="size-3.5" />} label="List" />
                  <ViewToggle current={view} setView={setView} mode="map" icon={<MapIcon className="size-3.5" />} label="Map" />
                </div>
              </motion.div>
            )}

            {loading && <SkeletonResults />}

            {!loading && results && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: view === "list" ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: view === "list" ? 30 : -30 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {view === "list" ? (
                    <>
                      <ResultsHeader query={lastQuery} count={filtered.length} total={results.length} />
                      {filtered.length === 0 ? (
                        <EmptyState />
                      ) : (
                        <motion.div
                          variants={containerStagger}
                          initial="hidden"
                          animate="show"
                          className="space-y-4 sm:space-y-5"
                        >
                          {filtered.map((h) => (
                            <HospitalCard key={h.id} hospital={h} onOpenTrace={setTraceFor} />
                          ))}
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <MapView hospitals={filtered} onSelect={setTraceFor} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {!loading && !results && <IdleState />}
          </div>
        </section>

        <TraceDrawer hospital={traceFor} onClose={() => setTraceFor(null)} />
      </div>
    </div>
  );
};

const ViewToggle = ({
  current,
  setView,
  mode,
  icon,
  label,
}: {
  current: "list" | "map";
  setView: (m: "list" | "map") => void;
  mode: "list" | "map";
  icon: React.ReactNode;
  label: string;
}) => {
  const active = current === mode;
  return (
    <button
      onClick={() => {
        if (current !== mode) haptic("select");
        setView(mode);
      }}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="view-toggle"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
};

const ResultsHeader = ({ query, count, total }: { query: string; count: number; total: number }) => (
  <div className="mb-4 sm:mb-5">
    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-mono-tech">
      Query
    </p>
    <p className="text-foreground/90 mt-1 text-sm break-words">"{query}"</p>
    <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 font-mono-tech">
      {count} of {total} matched · {TOTAL_INDEXED.toLocaleString()} indexed · sorted by trust
    </p>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 sm:p-10 text-center">
    <p className="text-sm text-muted-foreground">No facilities match this filter.</p>
  </div>
);

const PIPELINE = [
  {
    k: "Sources",
    v: "Gov · NABH · Institutional",
    d: "28 authority-weighted registries.",
    metric: "28",
    metricLabel: "feeds",
  },
  {
    k: "Verification",
    v: "3-pass cross-check",
    d: "Every claim contested before shipping.",
    metric: "3×",
    metricLabel: "passes",
  },
  {
    k: "Transparency",
    v: "Full trace per result",
    d: "Inspect every step and citation.",
    metric: "100%",
    metricLabel: "audit",
  },
] as const;

const IdleState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.4, duration: 0.6 }}
    className="relative mt-20 sm:mt-28"
  >
    {/* Asymmetric editorial header — oversized numeral collides with label */}
    <div className="relative mb-10 sm:mb-14 pl-2 sm:pl-4">
      <span
        aria-hidden
        className="absolute -top-6 sm:-top-10 -left-2 sm:left-0 text-[120px] sm:text-[180px] leading-none font-bold text-primary/[0.06] select-none tracking-tighter"
      >
        03
      </span>
      <div className="relative">
        <span className="text-[10px] uppercase tracking-[0.4em] text-primary/80 font-mono-tech">
          Method
        </span>
        <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight leading-[1.05] max-w-md">
          We don't <em className="not-italic text-primary">guess.</em>
          <br />
          We <span className="underline decoration-primary/40 decoration-2 underline-offset-[6px]">cross-examine.</span>
        </h2>
      </div>
    </div>

    {/* Off-grid layout: stacked rows with shifting indentation */}
    <div className="relative z-10 space-y-6 sm:space-y-8">
      {PIPELINE.map((c, i) => {
        return (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 0.12, duration: 0.5, ease: "easeOut" }}
            className="group relative flex items-start gap-4 sm:gap-6 max-w-2xl mx-auto"
          >
            {/* Big numeric marker */}
            <div className="shrink-0 pt-1 w-20">
              <div className="font-mono-tech text-[11px] text-muted-foreground/60 tracking-widest">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary/90 tabular-nums">
                {c.metric}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono-tech">
                {c.metricLabel}
              </div>
            </div>

            {/* Vertical rule that grows on hover */}
            <div className="self-stretch w-px bg-border/50 group-hover:bg-primary/60 transition-colors duration-500" />

            <div className="flex-1 pt-1">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono-tech">
                  {c.k}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-semibold tracking-tight leading-snug text-foreground/95">
                {c.v}
              </p>
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                {c.d}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default Index;
