export interface CompletedMissionNodeProps {
  x: number;
  y: number;
  number: number;
}

/**
 * Completed mission marker: a green/turquoise confirmation marker with a white
 * checkmark and the mission number below it, plus a very subtle glow. The check
 * glyph — not just colour — communicates the state.
 */
export default function CompletedMissionNode({ x, y, number }: CompletedMissionNodeProps) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden="true">
      <circle r="34" fill="#10b981" opacity="0.14" />
      <circle r="31" fill="none" stroke="#34d399" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle r="26" fill="#0f9d70" />
      <circle r="26" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2" />
      <text y={-5} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="800" fill="#ffffff">
        ✓
      </text>
      <text
        y={13}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="800"
        fill="#ffffff"
      >
        {number}
      </text>
    </g>
  );
}