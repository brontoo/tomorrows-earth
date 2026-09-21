import { motion } from "framer-motion";

export interface CurrentMissionNodeProps {
  x: number;
  y: number;
  number: number;
}

/**
 * Current mission marker: a gold node with the mission number centred and an
 * infinite gentle pulse, plus a soft glow. It is the ONLY pulsing marker on the
 * map. The "YOU ARE HERE" pill is a separate component (YouAreHereLabel) so
 * there is exactly one instance, controlled only by currentMissionId.
 */
export default function CurrentMissionNode({ x, y, number }: CurrentMissionNodeProps) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden="true">
      {/* soft ambient glow */}
      <circle r="30" fill="#FFD54A" opacity="0.14" />
      <motion.circle
        r={30}
        initial={false}
        fill="none"
        stroke="#FFD54A"
        strokeWidth={5}
        animate={{ r: [30, 42, 30], opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle r="24" fill="#FFD54A" />
      <circle r="24" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <text
        y={2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="800"
        fill="#5b3a00"
      >
        {number}
      </text>
    </g>
  );
}