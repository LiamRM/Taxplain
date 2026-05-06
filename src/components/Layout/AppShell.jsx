import React from "react";
import { COLORS } from "../../theme.js";

/**
 * Dashboard layout shell.
 *
 * Desktop layout (≥900px wide):
 *   ┌─────────────────────────────────────────┐
 *   │ HEADER — full width, fixed at top       │
 *   ├──────────────┬──────────────────────────┤
 *   │              │ TOOLTIP (sticky top)     │
 *   │   SIDEBAR    ├──────────────────────────┤
 *   │  (inputs)    │   MAIN (scrollable)      │
 *   │              │                          │
 *   └──────────────┴──────────────────────────┘
 *
 * Mobile layout (<900px wide): everything stacks vertically and the page
 * scrolls normally. The sidebar/sticky behavior is more confusing than
 * helpful on phone-sized screens.
 *
 * Slots:
 *   header  - title + summary metrics (full top row)
 *   sidebar - inputs panel (left column)
 *   tooltip - thin bar showing hover explanations (sticky atop main)
 *   main    - the scrollable area: flow diagrams + footnote
 */
export default function AppShell({
  header,
  sidebar,
  tooltip,
  main,
  isMobile,
}) {
  if (isMobile) {
    return (
      <div
        style={{
          fontFamily: "inherit",
          background: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div style={{ padding: "20px 18px" }}>{header}</div>
        <div style={{ padding: "0 18px" }}>{sidebar}</div>
        <div style={{ padding: "0 18px", flex: 1, overflowY: "auto" }}>{main}</div>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg, flexShrink: 0 }}>{tooltip}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "minmax(320px, 360px) 1fr",
        gridTemplateAreas: `
          "header  header"
          "sidebar main"
          "sidebar tooltip"
        `,
        background: COLORS.bg,
        color: COLORS.text,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          gridArea: "header",
          padding: "16px 24px 14px",
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.bgHeader,
          zIndex: 2,
        }}
      >
        {header}
      </div>

      <aside
        style={{
          gridArea: "sidebar",
          padding: "20px 22px",
          borderRight: `1px solid ${COLORS.border}`,
          background: COLORS.bgSubtle,
          overflowY: "auto",
          scrollbarGutter: "stable",
        }}
      >
        {sidebar}
      </aside>

      <main
        style={{
          gridArea: "main",
          overflowY: "auto",
          background: COLORS.bg,
          padding: "20px 28px 32px",
        }}
      >
        {main}
      </main>

      <div
        style={{
          gridArea: "tooltip",
          padding: "12px 28px",
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
          flexShrink: 0,
        }}
      >
        {tooltip}
      </div>
    </div>
  );
}