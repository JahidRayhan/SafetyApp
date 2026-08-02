import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with conflict resolution.
 * Canonical class merger for the SafeGuard codebase.
 */
export function mergeClasses(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** @deprecated Use `mergeClasses` instead. Kept for backward compatibility. */
export const cn = mergeClasses;
