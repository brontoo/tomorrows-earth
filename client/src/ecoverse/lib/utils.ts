import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coarse capability tier. Drives particle counts, blur usage and 3D
 * simplification so low-power devices get a lighter scene.
 */
export type DeviceTier = "high" | "medium" | "low";

export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "medium";
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  if (coarse || cores <= 4 || memory <= 2) return "low";
  if (small || cores <= 6 || memory <= 4) return "medium";
  return "high";
}

export const TIER_PARTICLE_COUNTS: Record<DeviceTier, number> = {
  high: 110,
  medium: 60,
  low: 26,
};
