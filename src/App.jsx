import React, { useState, useMemo, useCallback } from "react";
import { COLORS, FONT_STACK } from "./theme.js";
import { useTaxCalculation } from "./hooks/useTaxCalculation.js";
import { useContainerWidth, useViewportWidth } from "./hooks/useContainerWidth.js";
import { DEFAULT_YEAR } from "./data/federalBrackets.js";
import Header from "./components/Layout/Header.jsx";
import AppShell from "./components/Layout/AppShell.jsx";
import TooltipBar from "./components/Layout/TooltipBar.jsx";
import Footnote from "./components/Layout/Footnote.jsx";
import InputsPanel from "./components/Inputs/InputsPanel.jsx";
import FlowDiagram from "./components/FlowDiagram/FlowDiagram.jsx";
import {
  buildFederalGraph,
  buildFicaGraph,
  buildStateGraph,
} from "./components/FlowDiagram/flowModel.js";

const MOBILE_BREAKPOINT = 900;

/**
 * Top-level component. Owns all canonical input state plus the currently
 * hovered tooltip string. Layout is delegated to AppShell.
 */
export default function App() {
  // ── Canonical input state ─────────────────────────────────────────────
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [filing, setFiling] = useState("single");
  const [state, setState] = useState("OR");
  const [regularPct, setRegularPct] = useState(95);
  const [gross, setGross] = useState(86_000);
  const [taxableSpending, setTaxableSpending] = useState(22_000);

  // ── Hover/tooltip state — lifted from FlowDiagram so we can show a
  //    single sticky bar above the diagrams. Holds the tooltip string of
  //    whichever node or link is currently hovered (null when nothing is).
  const [tooltip, setTooltip] = useState(null);
  const handleHoverChange = useCallback((hover) => {
    setTooltip(hover ? hover.tooltip : null);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────
  const tax = useTaxCalculation({ gross, regularPct, filing, state, taxableSpending, year });
  const federalGraph = useMemo(() => buildFederalGraph(tax.federal), [tax.federal]);
  const ficaGraph = useMemo(() => buildFicaGraph(tax.fica), [tax.fica]);
  const stateGraph = useMemo(
    () => buildStateGraph(tax.state, tax.sales, gross),
    [tax.state, tax.sales, gross]
  );

  // ── Layout measurement ────────────────────────────────────────────────
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const [mainRef, mainWidth] = useContainerWidth();
  const diagramWidth = Math.max(380, mainWidth - 40);

  // Header width: same as the main panel on desktop (full width above the
  // sidebar+main grid). On desktop the sidebar is ~360px so the header
  // spans the full viewport. We measure with a separate ref.
  const [headerRef, headerWidth] = useContainerWidth(380, viewportWidth);

  const fontsLink = (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
    />
  );

  return (
    <div style={{ fontFamily: FONT_STACK, color: COLORS.text }}>
      {fontsLink}
      <AppShell
        isMobile={isMobile}
        header={
          <div ref={headerRef} >
            <Header tax={tax} availableWidth={headerWidth} />
          </div>
        }
        sidebar={
          <InputsPanel
            year={year}
            filing={filing}
            state={state}
            regularPct={regularPct}
            gross={gross}
            taxableSpending={taxableSpending}
            onYearChange={setYear}
            onFilingChange={setFiling}
            onStateChange={setState}
            onRegularPctChange={setRegularPct}
            onGrossChange={setGross}
            onTaxableSpendingChange={setTaxableSpending}
            flat={!isMobile}
          />
        }
        tooltip={<TooltipBar tooltip={tooltip} />}
        main={
          <div ref={mainRef}>
            <FlowDiagram
              graph={federalGraph}
              width={diagramWidth}
              title="Federal income tax"
              subtitle="Gross income → standard deduction + federal taxable → ordinary & LTCG brackets → federal tax / kept."
              legend={FEDERAL_LEGEND}
              onHoverChange={handleHoverChange}
            />
            <FlowDiagram
              graph={ficaGraph}
              width={diagramWidth}
              title="FICA payroll tax"
              subtitle="Wages (excludes capital gains) → Social Security 6.2% (capped), Medicare 1.45%, Additional Medicare 0.9% above filing threshold → FICA / kept."
              legend={FICA_LEGEND}
              onHoverChange={handleHoverChange}
            />
            <FlowDiagram
              graph={stateGraph}
              width={diagramWidth}
              title={`State taxes — income + sales (${tax.state.stateName})`}
              subtitle={
                tax.state.type === "none"
                  ? "No state income tax. After-tax income flows into taxable spending; sales tax peels off."
                  : "State income tax peels off first. Then taxable spending splits off into sales tax + goods value, with the rest as final after-tax income."
              }
              legend={STATE_LEGEND}
              onHoverChange={handleHoverChange}
            />
            <Footnote />
          </div>
        }
      />
    </div>
  );
}

const FEDERAL_LEGEND = [
  { color: COLORS.ordinary, label: "Ordinary" },
  { color: COLORS.capGains, label: "Cap gains" },
  { color: COLORS.deduction, label: "Deduction" },
  { color: COLORS.tax, label: "Tax paid" },
  { color: COLORS.kept, label: "Kept" },
];

const FICA_LEGEND = [
  { color: COLORS.fica, label: "FICA wages / tax" },
  { color: COLORS.deduction, label: "Above SS cap" },
  { color: COLORS.kept, label: "Kept" },
];

const STATE_LEGEND = [
  { color: COLORS.state, label: "State taxable" },
  { color: COLORS.deduction, label: "Deduction" },
  { color: COLORS.tax, label: "Income tax" },
  { color: COLORS.spending, label: "Spending" },
  { color: COLORS.sales, label: "Sales tax" },
  { color: COLORS.kept, label: "Kept" },
];