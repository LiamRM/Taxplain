import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";

/**
 * Sticky bar shown above the scrollable flow diagrams. When the user hovers
 * over a node or link in any diagram, this bar displays a plain-English
 * explanation of what they're looking at. When nothing is hovered, it shows
 * a hint prompting them to hover.
 *
 * Props:
 *   tooltip - the current tooltip string, or null when nothing is hovered
 */
export default function TooltipBar({ tooltip }) {
  const isActive = !!tooltip;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px",
        // background: isActive ? COLORS.bgSubtle : COLORS.bg,
        background: COLORS.bgTooltip,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        minHeight: 44,
        transition: "background 120ms ease",
        justifyContent: "center",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: MONO_STACK,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: isActive ? COLORS.textTooltip : COLORS.textFaint,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {isActive ? "Detail" : "Hint"}
      </span>
      <span
        style={{
          lineHeight: 1.4,
          color: isActive ? COLORS.textTooltip : COLORS.textSubtle,
          fontWeight: isActive ? 700 : 400,
          fontSize: isActive ? 16 : 13.5,
        }}
      >
        {tooltip ||
          "Hover over any band or bar in the diagrams below to see what it represents."}
      </span>
    </div>
  );
}