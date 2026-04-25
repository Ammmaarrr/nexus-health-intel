import { motion } from "framer-motion";
import type { Hospital } from "@/lib/mock";
import { PIN_ZONES } from "@/lib/mock";

interface Props {
  hospitals: Hospital[];
  onSelect: (h: Hospital) => void;
}

const colorFor = (s: number) =>
  s >= 0.75 ? "hsl(var(--trust-high))" : s >= 0.5 ? "hsl(var(--trust-mid))" : "hsl(var(--trust-low))";

const desertColor = (risk: number) =>
  risk >= 0.7 ? "hsl(var(--trust-low))" : risk >= 0.4 ? "hsl(var(--trust-mid))" : "hsl(var(--trust-high))";

// Project lat/lng → SVG (manual bounding box around Bihar)
const minLat = 24.5, maxLat = 26.5;
const minLng = 84.5, maxLng = 86.0;
const project = (lat: number, lng: number) => ({
  x: ((lng - minLng) / (maxLng - minLng)) * 600 + 50,
  y: 500 - ((lat - minLat) / (maxLat - minLat)) * 400,
});

export const MapView = ({ hospitals, onSelect }: Props) => {
  return (
    <div className="relative rounded-2xl bg-card border border-border/60 p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-glow-radial pointer-events-none" />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech">
          Geographic Cluster — Bihar Region
        </p>
        <div className="flex items-center gap-3 text-[10px] font-mono-tech text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-low" /> high-risk PIN
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-mid" /> mid-risk
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-high" /> served
          </span>
        </div>
      </div>
      <svg viewBox="0 0 700 540" className="w-full h-auto">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <radialGradient id="desert-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="70%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="700" height="540" fill="url(#grid)" />

        {/* stylized region polygon */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d="M 90 130 Q 220 80 380 110 T 640 180 Q 660 320 580 430 T 280 470 Q 130 440 80 320 Z"
          fill="hsl(var(--primary) / 0.05)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* PIN-code desert overlays — drawn beneath markers */}
        {PIN_ZONES.map((z, i) => {
          const { x, y } = project(z.center.lat, z.center.lng);
          const c = desertColor(z.risk);
          return (
            <motion.g
              key={z.pin}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.7 }}
              style={{ transformOrigin: `${x}px ${y}px`, color: c }}
            >
              <circle cx={x} cy={y} r={z.radius} fill="url(#desert-gradient)" />
              <circle
                cx={x}
                cy={y}
                r={z.radius}
                fill="none"
                stroke={c}
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity="0.5"
              />
              <text
                x={x}
                y={y - z.radius - 6}
                textAnchor="middle"
                fontSize="9"
                fill={c}
                className="font-mono-tech"
                opacity="0.85"
              >
                PIN {z.pin} · {(z.risk * 100).toFixed(0)}%
              </text>
            </motion.g>
          );
        })}

        {hospitals.map((h, i) => {
          const { x, y } = project(h.coords.lat, h.coords.lng);
          const c = colorFor(h.trust_score);
          return (
            <motion.g
              key={h.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 + i * 0.15, type: "spring", stiffness: 240 }}
              style={{ cursor: "pointer", transformOrigin: `${x}px ${y}px` }}
              onClick={() => onSelect(h)}
            >
              <circle cx={x} cy={y} r="22" fill={c} opacity="0.18">
                <animate attributeName="r" values="22;32;22" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.18;0;0.18" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="10" fill={c} stroke="hsl(var(--background))" strokeWidth="3" />
              <text
                x={x}
                y={y - 18}
                textAnchor="middle"
                fontSize="11"
                fill="hsl(var(--foreground))"
                fontWeight="600"
              >
                {h.name.replace("Rural Health Centre ", "RHC ").replace("District Hospital ", "DH ")}
              </text>
              <text
                x={x}
                y={y + 28}
                textAnchor="middle"
                fontSize="10"
                fill={c}
                className="font-mono-tech"
              >
                {(h.trust_score * 100).toFixed(0)}%
              </text>
            </motion.g>
          );
        })}
      </svg>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Heat zones aggregate risk by PIN code. Tap a marker to open its verification trace.
      </p>
    </div>
  );
};
