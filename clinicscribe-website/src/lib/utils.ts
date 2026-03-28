import { type ClassValue, clsx } from "clsx";

// Simple clsx implementation (no need for tailwind-merge with Tailwind v4)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// clsx minimal implementation if not installed
export { clsx } from "clsx";
