import { motion } from "framer-motion";

export const HeartbeatLogo = ({ size = 36 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
    <span className="absolute inset-0 rounded-full bg-primary/15" />
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="relative animate-heartbeat text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h3l2-6 4 12 2-6h7" />
    </motion.svg>
  </div>
);