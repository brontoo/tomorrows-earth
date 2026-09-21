export interface YouAreHereLabelProps {
  x: number;
  y: number;
}

/**
 * The single "YOU ARE HERE" pill on the map.
 *
 * Rendered exactly once per map — controlled by `currentMissionId`. The caret
 * points up through the pill toward the pulsing current-mission node above it,
 * and the pill is kept deliberately legible (light-on-midnight) so it reads
 * over any art beneath it.
 */
export default function YouAreHereLabel({ x, y }: YouAreHereLabelProps) {
  return (
    <g
      transform={`translate(${x}, ${y + 50})`}
      aria-label="You are here"
      role="img"
      pointerEvents="none"
    >
      {/* caret pointing up toward the current mission node */}
      <polygon points="0,-13 -9,-23 9,-23" fill="#FFD54A" />
      <rect x="-58" y="-13" width="116" height="26" rx="13" fill="#0f172a" opacity="0.9" />
      <rect x="-58" y="-13" width="116" height="26" rx="13" fill="none" stroke="#FFD54A" strokeOpacity="0.9" strokeWidth="1.5" />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12.5"
        fontWeight="800"
        letterSpacing="1.6"
        fill="#FFD54A"
      >
        YOU ARE HERE
      </text>
    </g>
  );
}