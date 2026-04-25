import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
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

const VIEW_W = 700;
const VIEW_H = 540;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

const minLat = 24.5, maxLat = 26.5;
const minLng = 84.5, maxLng = 86.0;
const project = (lat: number, lng: number) => ({
  x: ((lng - minLng) / (maxLng - minLng)) * 600 + 50,
  y: 500 - ((lat - minLat) / (maxLat - minLat)) * 400,
});

interface Transform {
  scale: number;
  tx: number;
  ty: number;
}

const IDENTITY: Transform = { scale: 1, tx: 0, ty: 0 };

const clampTransform = (t: Transform): Transform => {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale));
  // Keep content from drifting fully off-screen.
  const maxX = (VIEW_W * (scale - 1)) / 2;
  const maxY = (VIEW_H * (scale - 1)) / 2;
  return {
    scale,
    tx: Math.min(maxX, Math.max(-maxX, t.tx)),
    ty: Math.min(maxY, Math.max(-maxY, t.ty)),
  };
};

export const MapView = ({ hospitals, onSelect }: Props) => {
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [pinned, setPinned] = useState<Hospital | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStart = useRef<{
    transform: Transform;
    distance: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const panStart = useRef<{ x: number; y: number; transform: Transform } | null>(null);
  const didPan = useRef(false);

  // Convert client (px) coords → svg viewBox coords given current scale/translate.
  const clientToSvg = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * VIEW_W;
      const py = ((clientY - rect.top) / rect.height) * VIEW_H;
      // Reverse the transform: svg shows (px - cx)/scale + cx - tx/scale-ish.
      // Our transform applied is: scale * (point) + translate(tx, ty), centered via SVG viewBox.
      // We render with transform="translate(tx,ty) scale(scale)" around viewBox origin.
      return { x: (px - transform.tx) / transform.scale, y: (py - transform.ty) / transform.scale };
    },
    [transform],
  );

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    setTransform((prev) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
      if (newScale === prev.scale) return prev;
      // Default pivot: container center
      let pivotX = VIEW_W / 2;
      let pivotY = VIEW_H / 2;
      const svg = svgRef.current;
      if (svg && clientX !== undefined && clientY !== undefined) {
        const rect = svg.getBoundingClientRect();
        pivotX = ((clientX - rect.left) / rect.width) * VIEW_W;
        pivotY = ((clientY - rect.top) / rect.height) * VIEW_H;
      }
      // Keep pivot point stationary in screen space.
      const ratio = newScale / prev.scale;
      const tx = pivotX - (pivotX - prev.tx) * ratio;
      const ty = pivotY - (pivotY - prev.ty) * ratio;
      return clampTransform({ scale: newScale, tx, ty });
    });
  }, []);

  const reset = useCallback(() => {
    setTransform(IDENTITY);
    setPinned(null);
  }, []);

  // Wheel-to-zoom (desktop trackpad / mouse wheel).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomAt(factor, e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Pointer handlers — covers touch + mouse + pen for pinch + pan.
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    didPan.current = false;

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      gestureStart.current = {
        transform,
        distance,
        centerX: (a.x + b.x) / 2,
        centerY: (a.y + b.y) / 2,
      };
      panStart.current = null;
    } else if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, transform };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && gestureStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = distance / gestureStart.current.distance;
      const start = gestureStart.current.transform;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, start.scale * ratio));
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const pivotX = ((gestureStart.current.centerX - rect.left) / rect.width) * VIEW_W;
      const pivotY = ((gestureStart.current.centerY - rect.top) / rect.height) * VIEW_H;
      const k = newScale / start.scale;
      const tx = pivotX - (pivotX - start.tx) * k;
      const ty = pivotY - (pivotY - start.ty) * k;
      setTransform(clampTransform({ scale: newScale, tx, ty }));
      didPan.current = true;
    } else if (pointers.current.size === 1 && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didPan.current = true;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      // Convert screen px delta → svg viewBox delta.
      const sx = (dx / rect.width) * VIEW_W;
      const sy = (dy / rect.height) * VIEW_H;
      setTransform(
        clampTransform({
          ...panStart.current.transform,
          tx: panStart.current.transform.tx + sx,
          ty: panStart.current.transform.ty + sy,
        }),
      );
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gestureStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  };

  // Tap a marker → pin its preview card. Ignore if user was panning.
  const handleMarkerTap = (h: Hospital) => {
    if (didPan.current) return;
    setPinned((prev) => (prev?.id === h.id ? null : h));
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl bg-card border border-border/60 p-3 sm:p-6 overflow-hidden touch-none select-none"
    >
      <div className="absolute inset-0 opacity-30 bg-glow-radial pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono-tech">
          Geographic Cluster — Bihar Region
        </p>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono-tech text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-low" /> high-risk
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-mid" /> mid
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-trust-high" /> served
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full h-auto cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
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

          {/* Static grid (does not scale — gives a stable backdrop) */}
          <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

          {/* Everything below is transformed by pan/zoom */}
          <g
            style={{
              transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
              transformOrigin: "0 0",
              transition: pointers.current.size > 0 ? "none" : "transform 200ms ease-out",
            }}
          >
            {/* stylized region polygon */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              d="M 90 130 Q 220 80 380 110 T 640 180 Q 660 320 580 430 T 280 470 Q 130 440 80 320 Z"
              fill="hsl(var(--primary) / 0.05)"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth={1.5 / transform.scale}
              strokeDasharray={`${4 / transform.scale} ${4 / transform.scale}`}
            />

            {/* PIN-code desert overlays */}
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
                    strokeWidth={1 / transform.scale}
                    strokeDasharray={`${3 / transform.scale} ${4 / transform.scale}`}
                    opacity="0.5"
                  />
                  <text
                    x={x}
                    y={y - z.radius - 6}
                    textAnchor="middle"
                    fontSize={Math.max(7, 9 / transform.scale)}
                    fill={c}
                    className="font-mono-tech pointer-events-none"
                    opacity="0.85"
                  >
                    PIN {z.pin} · {(z.risk * 100).toFixed(0)}%
                  </text>
                </motion.g>
              );
            })}

            {/* Hospital markers — extra large invisible touch target on top of visible dot */}
            {hospitals.map((h, i) => {
              const { x, y } = project(h.coords.lat, h.coords.lng);
              const c = colorFor(h.trust_score);
              const isPinned = pinned?.id === h.id;
              const baseR = 12;
              const visibleR = isPinned ? baseR + 2 : baseR;
              return (
                <motion.g
                  key={h.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.15, type: "spring", stiffness: 240 }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  {/* Pulse ring */}
                  <circle cx={x} cy={y} r={baseR * 2} fill={c} opacity="0.18" pointerEvents="none">
                    <animate attributeName="r" values={`${baseR * 2};${baseR * 3};${baseR * 2}`} dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.18;0;0.18" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  {/* Visible dot — scales with zoom but capped */}
                  <circle
                    cx={x}
                    cy={y}
                    r={visibleR / Math.max(1, transform.scale * 0.6)}
                    fill={c}
                    stroke="hsl(var(--background))"
                    strokeWidth={3 / Math.max(1, transform.scale * 0.6)}
                    pointerEvents="none"
                  />
                  {/* Label — hide when zoomed in to reduce clutter */}
                  {transform.scale < 2.5 && (
                    <text
                      x={x}
                      y={y - 22 / Math.max(1, transform.scale * 0.6)}
                      textAnchor="middle"
                      fontSize={Math.max(8, 11 / transform.scale)}
                      fill="hsl(var(--foreground))"
                      fontWeight="600"
                      pointerEvents="none"
                    >
                      {h.name.replace("Rural Health Centre ", "RHC ").replace("District Hospital ", "DH ")}
                    </text>
                  )}
                  <text
                    x={x}
                    y={y + 30 / Math.max(1, transform.scale * 0.6)}
                    textAnchor="middle"
                    fontSize={Math.max(8, 10 / transform.scale)}
                    fill={c}
                    className="font-mono-tech"
                    pointerEvents="none"
                  >
                    {(h.trust_score * 100).toFixed(0)}%
                  </text>
                  {/* Large invisible touch target — min 44px equivalent at viewBox scale */}
                  <circle
                    cx={x}
                    cy={y}
                    r={28 / Math.max(1, transform.scale)}
                    fill="transparent"
                    style={{ cursor: "pointer", touchAction: "none" }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      handleMarkerTap(h);
                    }}
                  />
                </motion.g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls — large touch targets (≥44px) */}
        <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex flex-col gap-1.5 z-10">
          <ZoomBtn label="Zoom in" onClick={() => zoomAt(1.4)}>
            <Plus className="size-4 sm:size-5" />
          </ZoomBtn>
          <ZoomBtn label="Zoom out" onClick={() => zoomAt(1 / 1.4)}>
            <Minus className="size-4 sm:size-5" />
          </ZoomBtn>
          <ZoomBtn label="Reset view" onClick={reset}>
            <RotateCcw className="size-4 sm:size-5" />
          </ZoomBtn>
        </div>

        {/* Scale indicator */}
        {transform.scale > 1.05 && (
          <div className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 text-[10px] font-mono-tech text-muted-foreground bg-card/80 backdrop-blur border border-border/60 rounded-md px-2 py-1 pointer-events-none">
            {transform.scale.toFixed(1)}×
          </div>
        )}

        {/* Tap-to-pin preview card */}
        <AnimatePresence>
          {pinned && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="absolute left-2 right-2 sm:left-auto sm:right-3 sm:top-3 sm:max-w-xs rounded-2xl bg-card/95 backdrop-blur border border-border/70 shadow-elevated p-3 sm:p-4 z-20"
              style={{ top: "0.5rem" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-mono-tech">
                    Pinned facility
                  </p>
                  <h4 className="text-sm font-semibold truncate">{pinned.name}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {pinned.location} · PIN {pinned.pin}
                  </p>
                </div>
                <button
                  onClick={() => setPinned(null)}
                  aria-label="Close pin"
                  className="size-9 -mr-1 -mt-1 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="size-2.5 rounded-full"
                  style={{ background: colorFor(pinned.trust_score) }}
                />
                <span className="text-xs font-mono-tech" style={{ color: colorFor(pinned.trust_score) }}>
                  {(pinned.trust_score * 100).toFixed(0)}% ±{(pinned.trust_interval * 100).toFixed(0)} trust
                </span>
                <span className="text-[10px] uppercase text-muted-foreground tracking-wider ml-auto">
                  {pinned.region}
                </span>
              </div>
              <button
                onClick={() => onSelect(pinned)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground hover:shadow-[0_0_24px_hsl(var(--primary)/0.5)] transition"
              >
                Open verification trace
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-2">
        Pinch to zoom · drag to pan · tap a marker to pin details
      </p>
    </div>
  );
};

const ZoomBtn = ({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="size-11 sm:size-10 inline-flex items-center justify-center rounded-xl bg-card/90 backdrop-blur border border-border/70 text-foreground shadow-md hover:bg-secondary hover:text-primary transition"
  >
    {children}
  </button>
);
