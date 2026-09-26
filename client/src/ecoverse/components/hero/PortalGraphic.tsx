import { useId } from "react";
import { WorldGlyph, type WorldKind } from "../game/WorldGlyph";

const INNER_WORLDS: { kind: WorldKind; angle: number; radius: number; size: number }[] = [
  { kind: "water", angle: -90, radius: 78, size: 30 },
  { kind: "energy", angle: -28, radius: 84, size: 27 },
  { kind: "desert", angle: 28, radius: 84, size: 27 },
  { kind: "forest", angle: 90, radius: 78, size: 30 },
  { kind: "city", angle: 152, radius: 84, size: 27 },
  { kind: "ocean", angle: -152, radius: 84, size: 27 },
  { kind: "mountains", angle: 0, radius: 0, size: 34 },
];

/**
 * The EcoVerse portal: nested orbit rings around a core that holds the
 * environmental worlds. Brightness and charge respond to how many fragments
 * the explorer has secured.
 */
export default function PortalGraphic({
  charge = 0,
  armed = false,
  size = 620,
}: {
  /** 0–3 fragments secured. */
  charge?: number;
  armed?: boolean;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const c = 200;
  const disc = 122;

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className="ev-portal__svg"
      role="img"
      aria-label="EcoVerse portal containing the environmental worlds: water, desert, forest, clean city, renewable energy, ocean and mountains"
    >
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-ev-aqua)" stopOpacity="0.4" />
          <stop offset="42%" stopColor="var(--color-ev-teal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-ev-abyss)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`core-${uid}`} cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="oklch(0.34 0.07 222)" />
          <stop offset="55%" stopColor="oklch(0.2 0.055 254)" />
          <stop offset="100%" stopColor="oklch(0.11 0.035 270)" />
        </radialGradient>

        <linearGradient id={`rim-${uid}`} x1="60" y1="40" x2="340" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-ev-aqua)" />
          <stop offset="0.45" stopColor="var(--color-ev-teal-lit)" />
          <stop offset="1" stopColor="var(--color-ev-emerald-lit)" />
        </linearGradient>

        <linearGradient id={`arc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--color-ev-aqua)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-ev-emerald)" stopOpacity="0.15" />
        </linearGradient>

        <clipPath id={`disc-${uid}`}>
          <circle cx={c} cy={c} r={disc} />
        </clipPath>

        <filter id={`soft-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* atmosphere */}
      <circle cx={c} cy={c} r="198" fill={`url(#aura-${uid})`} />
      <circle
        className="ev-portal__charge"
        style={{ ["--charge" as string]: charge }}
        cx={c}
        cy={c}
        r={150}
        fill="none"
        stroke={`url(#rim-${uid})`}
        strokeWidth="26"
        strokeOpacity="0.5"
        filter={`url(#soft-${uid})`}
      />

      {/* structural rings */}
      <circle cx={c} cy={c} r="178" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="1" opacity="0.5" />
      <circle
        className="ev-ring-spin"
        cx={c}
        cy={c}
        r="164"
        fill="none"
        stroke={`url(#rim-${uid})`}
        strokeWidth="1.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle
        className="ev-ring-spin ev-ring-spin--rev"
        cx={c}
        cy={c}
        r="150"
        fill="none"
        stroke={`url(#arc-${uid})`}
        strokeWidth="2.4"
        strokeDasharray="46 300"
        strokeLinecap="round"
      />
      <g className="ev-ring-spin ev-ring-spin--fast" opacity="0.75">
        <circle cx={c} cy={c} r="136" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="0.8" strokeDasharray="1 7" />
        <circle cx={c} cy={30} r="2.6" fill="var(--color-ev-chalk)" />
        <circle cx={c + 136} cy={c} r="2.2" fill="var(--color-ev-aqua)" />
        <circle cx={c} cy={c + 136} r="2.2" fill="var(--color-ev-emerald-lit)" />
      </g>

      {/* orbital path — the planetary reference */}
      <g className="ev-portal__orbit">
        <ellipse
          cx={c}
          cy={c}
          rx="192"
          ry="66"
          fill="none"
          stroke={`url(#rim-${uid})`}
          strokeWidth="1.2"
          strokeDasharray="5 9"
          opacity="0.5"
        />
        <circle cx={c + 192} cy={c} r="4" fill="var(--color-ev-aqua)" />
        <circle cx={c + 192} cy={c} r="9" fill="var(--color-ev-aqua)" opacity="0.25" />
      </g>

      {/* core world */}
      <g clipPath={`url(#disc-${uid})`}>
        <circle cx={c} cy={c} r={disc} fill={`url(#core-${uid})`} />

        {/* horizon band inside the disc */}
        <g className="ev-portal__breathe">
          <path d="M0 232c40-22 78 10 118-6s76-26 118-6 96 8 164-14v200H0Z" fill="oklch(0.16 0.05 250 / 0.85)" />
          <path d="M0 268c46-18 84 12 128-4s82-20 128-4 92 6 144-12v160H0Z" fill="oklch(0.2 0.06 195 / 0.7)" />
          <path d="M0 306c50-14 88 10 132-4s86-14 132-4 84 4 136-10v120H0Z" fill="oklch(0.26 0.07 165 / 0.5)" />
        </g>

        {/* concentric data rings inside the core */}
        <g opacity="0.28" fill="none" stroke="var(--color-ev-aqua)" strokeWidth="0.7">
          <circle cx={c} cy={c} r="46" />
          <circle cx={c} cy={c} r="66" strokeDasharray="2 6" />
          <circle cx={c} cy={c} r="88" />
        </g>

        <circle cx={c} cy={c} r="34" fill="var(--color-ev-aqua)" opacity="0.12" filter={`url(#soft-${uid})`} />
      </g>

      <circle
        className="ev-portal__breathe"
        cx={c}
        cy={c}
        r={disc}
        fill="none"
        stroke={`url(#rim-${uid})`}
        strokeWidth="2"
        opacity="0.9"
      />
      <circle cx={c} cy={c} r={disc} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />

      {/* environmental worlds held inside the portal */}
      <g>
        {INNER_WORLDS.map((world) => {
          const rad = (world.angle * Math.PI) / 180;
          const x = c + Math.cos(rad) * world.radius;
          const y = c + Math.sin(rad) * world.radius;
          return (
            <g key={world.kind} transform={`translate(${x - world.size / 2} ${y - world.size / 2})`}>
              <WorldGlyph kind={world.kind} size={world.size} radius={0.24} />
            </g>
          );
        })}
      </g>

      {/* readiness flare */}
      {armed && (
        <g className="ev-ring-spin" style={{ transformOrigin: `${c}px ${c}px` }}>
          <circle cx={c} cy={c} r="188" fill="none" stroke="var(--color-ev-emerald-lit)" strokeWidth="2" strokeDasharray="20 26" opacity="0.9" />
        </g>
      )}
    </svg>
  );
}
