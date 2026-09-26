import { useCallback, useEffect, useRef, useState } from "react";

/** Live `prefers-reduced-motion` — respects mid-session OS changes. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * Normalised pointer position (-1 → 1) written onto `--px` / `--py` custom
 * properties. Layers read those vars with their own `--depth`, so a single
 * listener drives the whole parallax stack.
 *
 * Pointer is ignored on touch devices and when reduced motion is requested.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !finePointer) return;

    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        node.style.setProperty("--px", x.toFixed(4));
        node.style.setProperty("--py", y.toFixed(4));
      });
    };

    const onLeave = () => {
      node.style.setProperty("--px", "0");
      node.style.setProperty("--py", "0");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [finePointer, reduced]);

  return ref;
}

/**
 * Pointer-driven 3D tilt. Writes `--rx` / `--ry` (and a cursor position used
 * for the button sheen) without triggering a React render.
 */
export function useTilt<T extends HTMLElement>(strength = 8) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const node = ref.current;
      if (!node || reduced || !finePointer) return;
      const rect = node.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width;
      const relY = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--ry", `${(relX - 0.5) * strength * 2}deg`);
      node.style.setProperty("--rx", `${(0.5 - relY) * strength * 2}deg`);
      node.style.setProperty("--mx", `${relX * 100}%`);
      node.style.setProperty("--my", `${relY * 100}%`);
    },
    [finePointer, reduced, strength],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--mx", "50%");
    node.style.setProperty("--my", "50%");
  }, []);

  return { ref, onPointerMove, onPointerLeave, tiltStyle: { transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" } };
}

/** Counts up to `value` once the element scrolls into view. */
export function useCountUp(value: number, duration = 1400) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || done.current) return;
    done.current = true;

    if (reduced) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [duration, reduced, value]);

  return { ref, display };
}

/** Tracks which section id is closest to the viewport centre. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
