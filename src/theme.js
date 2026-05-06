// ============================================================================
// THEME CONSTANTS
// Shared color palette and typography tokens used across the app.
// ============================================================================

export const COLORS = {
  // Neutrals
  text: "#0f172a",
  textMuted: "#4b5563",
  textSubtle: "#6b7280",
  textFaint: "#9ca3af",
  textTooltip: "#f3f4f6",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  bg: "#ffffff",
  bgTooltip: "#272727",
  bgHeader: "rgb(235, 235, 235)",
  bgSubtle: "#f9fafb",
  bgMuted: "#f3f4f6",

  // Semantic
  ordinary: "#2d5489",   // ordinary income / federal
  capGains: "#f08000",   // capital gains
  state:    "#dc2626",   // state tax
  tax:      "#dc2626",   // tax / outflow
  kept:     "#10b981",   // after-tax / inflow remaining
  deduction: "#94a3b8",  // standard deduction (untaxed)
  fica:     "#dc2626",   // FICA payroll tax (federal)
  sales:    "#dc2626",   // sales tax (state)
  spending: "#475569",   // taxable spending (gray-slate)
  wages:    "#2d5489",   // wages (subject to FICA)
};

export const FONT_STACK = "'Inter', system-ui, -apple-system, sans-serif";
export const MONO_STACK = "'JetBrains Mono', monospace";