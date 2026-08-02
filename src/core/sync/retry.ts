/**
 * Exponential backoff with jitter, capped. Pure function so it can be
 * used by any queue/sync primitive without taking a dependency on a
 * scheduler.
 */
export interface BackoffOptions {
  /** Base delay in ms. */
  base?: number;
  /** Multiplier per attempt. */
  factor?: number;
  /** Hard upper bound in ms. */
  max?: number;
  /** Add 0–25% random jitter to avoid thundering-herd retries. */
  jitter?: boolean;
}

export const computeBackoff = (
  attempt: number,
  opts: BackoffOptions = {},
): number => {
  const { base = 5_000, factor = 2, max = 15 * 60_000, jitter = true } = opts;
  const raw = base * Math.pow(factor, Math.max(0, attempt - 1));
  const capped = Math.min(raw, max);
  if (!jitter) return capped;
  return Math.floor(capped * (1 + Math.random() * 0.25));
};

export const MAX_DEFAULT_ATTEMPTS = 8;
