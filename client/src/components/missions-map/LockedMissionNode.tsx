export interface LockedMissionNodeProps {
  x: number;
  y: number;
  number: number;
}

/**
 * Locked mission waypoint: a compact, premium marker that reveals the full
 * 15-stage journey without overwhelming the artwork.
 *
 *   - small circular waypoint, dark navy / translucent glass
 *   - thin silver border
 *   - mission number centred (so the journey reads left-to-right)
 *   - a small lock glyph tucked at the ring
 *   - ~55–60% overall opacity, subtle shadow
 *
 * No large labels — titles only appear on hover/tap via the tooltip.
 */
export default function LockedMissionNode({ x, y, number }: LockedMissionNodeProps) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={0.6} aria-hidden="true">
      <circle cy={1.5} r="19" fill="#000000" opacity="0.16" />
      <circle r="17" fill="#0c1d30" opacity="0.62" />
      <circle r="17" fill="none" stroke="#cbd5e1" strokeOpacity="0.75" strokeWidth="1.2" />
      <circle r="10" fill="none" stroke="#94a3b8" strokeOpacity="0.5" strokeWidth="0.8" />
      <text
        y={2.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="800"
        fill="#e2e8f0"
      >
        {number}
      </text>
      {/* small lock glyph pinned to the top-right of the waypoint */}
      <path
        d="M 8 -9 a 4 4 0 0 0 -8 0"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="4.2" y="-8.4" width="7.6" height="6.4" rx="1.6" fill="#94a3b8" />
    </g>
  );
}