import { motion } from "framer-motion";
import type { Hospital } from "@/lib/mock";

interface Props {
  hospitals: Hospital[];
  onSelect: (h: Hospital) => void;
}

const colorFor = (s: number) =>
  s >= 0.75 ? "hsl(var(--trust-high))" : s >= 0.5 ? "hsl(var(--trust-mid))" : "hsl(var(--trust-low))";

// Simple stylized SVG map (Bihar-region inspired) — no external map dependency.
export const MapView = ({ hospitals, onSelect }: Props) => {
  // Project lat/lng → SVG (manual bounding box around Bihar)
  const minLat = 24.5, maxLat = 26.5;
  const minLng = 84.5, maxLng = 86.0;
  const project = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 600 + 50,
    y: 500 - ((lat - minLat) / (maxLat - minLat)) * 400,
  });

  return (
    <div className="relative rounded-2xl bg-card border border-border/60 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-glow-radial pointer-events-none" />
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech mb-3">
        Geographic Cluster — Bihar Region
      </p>
      <svg viewBox="0 0 700 540" className="w-full h-auto">
        {/* grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
          </pattern>
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

        {hospitals.map((h, i) => {
          const { x, y } = project(h.coords.lat, h.coords.lng);
          const c = colorFor(h.trust_score);
          return (
            <motion.g
              key={h.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 240 }}
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
        Click a marker to open its verification trace.
      </p>
    </div>
  );
};