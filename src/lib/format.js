// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/** Formats a number as compact money (e.g. $1.2M, $25k, $980). */
export function formatMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

/** Formats a number as full money with thousands separators (e.g. $123,456). */
export function formatMoneyFull(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

/** Formats a fraction as a percentage with the given precision (default 2). */
export function formatPct(fraction, digits = 2) {
  return `${(fraction * 100).toFixed(digits)}%`;
}
