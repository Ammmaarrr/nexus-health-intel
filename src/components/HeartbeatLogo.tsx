import logoMark from "@/assets/logo-mark.png";

export const HeartbeatLogo = ({ size = 36 }: { size?: number }) => (
  <div
    className="relative inline-flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <span className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse-ring" />
    <img
      src={logoMark}
      alt="Healthcare.Intel logo"
      width={size}
      height={size}
      className="relative drop-shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
    />
  </div>
);