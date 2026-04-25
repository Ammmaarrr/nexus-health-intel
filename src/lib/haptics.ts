/**
 * Haptic feedback helper. Uses the Web Vibration API where available
 * (Android Chrome, most Android browsers). On iOS Safari this silently
 * no-ops — that's expected; the app stays fully functional.
 *
 * Patterns are kept short to feel like native UI taps, never buzzy.
 */

type HapticKind = "tap" | "select" | "success" | "warning" | "error" | "impact";

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,           // light pip — buttons, chips
  select: 12,       // toggle, filter switch
  success: [10, 40, 14],
  warning: [18, 30, 18],
  error: [24, 40, 24, 40, 24],
  impact: 22,       // marker pin, drawer open
};

const canVibrate = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.vibrate === "function";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const haptic = (kind: HapticKind = "tap") => {
  if (!canVibrate() || prefersReducedMotion()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // Some browsers throw if called too frequently — safe to ignore.
  }
};

/** Convenience wrapper: runs haptic, then the handler. */
export const withHaptic =
  <T extends (...args: never[]) => unknown>(kind: HapticKind, fn: T) =>
  ((...args: Parameters<T>) => {
    haptic(kind);
    return fn(...args);
  }) as T;