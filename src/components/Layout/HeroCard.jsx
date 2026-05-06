import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";

/**
 * Compact metric card for use inline in the page header.
 *
 * Props:
 *   label  - small uppercase label (e.g. "Federal income")
 *   value  - the displayed metric value (e.g. "$22,367")
 *   accent - left-border color used to categorize the metric
 */
export default function HeroCard({ label, value, accent = COLORS.text }) {
  return (
    <div
      style={{
        background: COLORS.bgSubtle,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 6,
        padding: "8px 10px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLORS.textSubtle,
          fontWeight: 600,
          marginBottom: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 15,
          fontWeight: 700,
          color: accent,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}