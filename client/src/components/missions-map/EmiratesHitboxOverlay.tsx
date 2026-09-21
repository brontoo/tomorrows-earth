import { useEffect, useState } from "react";

/**
 * The interactive Emirates hitbox artwork (`ChatGPT Image Sep 21, 2026,
 * 09_41_40 AM.svg`). Rendered INLINE (not via <img>) so the internal <path>
 * elements live in the DOM and can be targeted with CSS hover/glow rules in
 * index.css (see `.emirates-hitbox-layer path`).
 *
 * The paths carry no visible paint of their own — CSS fills them transparent so
 * the whole emirate shape is the hover target, and lights them up gold on
 * :hover. The layer sits exactly on top of the base map artwork.
 */
const HITBOX_SVG_URL = "/maps/ChatGPT%20Image%20Sep%2021%2C%202026%2C%2009_41_40%20AM.svg";

export default function EmiratesHitboxOverlay() {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(HITBOX_SVG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Emirates hitbox SVG (${res.status})`);
        return res.text();
      })
      .then((raw) => {
        // Drop the XML/DTD prologue so only the <svg> root is injected.
        const cleaned = raw.replace(/<\?xml[^>]*\?>/i, "").replace(/<!DOCTYPE[^>]*>/i, "").trim();
        if (!cancelled) setSvgContent(cleaned);
      })
      .catch(() => {
        if (!cancelled) setSvgContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="emirates-hitbox-layer absolute inset-0 h-full w-full overflow-hidden"
      aria-hidden="true"
      dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
    />
  );
}