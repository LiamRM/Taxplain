import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";
import { formatMoneyFull, formatPct } from "../../lib/format.js";
import HeroCard from "./HeroCard.jsx";

/**
 * Top-bar header. Title on the left, tax-summary cards on the right.
 *
 * Props:
 *   tax            - the full tax result object from useTaxCalculation
 *   availableWidth - width of the area the header lives in (drives the
 *                    grid columns of the hero cards: 6/3/2 cols).
 */
export default function Header({ tax, availableWidth }) {
  // Card grid: 6-up on wide screens, 3-up on medium, 2-up on narrow.
  // The breakpoints reserve roughly 280px for the title block.
  const cardCols =
    availableWidth >= 1080
      ? "repeat(6, minmax(0, 1fr))"
      : availableWidth >= 720
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(2, minmax(0, 1fr))";

  const totalIncome = tax.federal.gross;
  const keepPct = totalIncome > 0 ? (tax.afterTaxIncome / totalIncome) * 100 : 0;
  const taxPct = totalIncome > 0 ? (tax.totalTax / totalIncome) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "0 0 auto", minWidth: '320px' }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
            color: COLORS.text,
          }}
        >
          Taxplain
        </h1>
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.textFaint,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          See where your taxes go
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: cardCols,
          gap: 8,
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <HeroCard
          label="Federal income"
          value={formatMoneyFull(tax.federal.totalTax)}
          accent={COLORS.tax}
        />
        <HeroCard
          label="FICA"
          value={formatMoneyFull(tax.fica.totalTax)}
          accent={COLORS.fica}
        />
        <HeroCard
          label={`State (${tax.state.state})`}
          value={tax.state.type === "none" ? "—" : formatMoneyFull(tax.state.totalTax)}
          accent={COLORS.state}
        />
        <HeroCard
          label={`Sales (${formatPct(tax.sales.rate, 2)})`}
          value={formatMoneyFull(tax.sales.totalTax)}
          accent={COLORS.sales}
        />
        <HeroCard
          label="Combined eff."
          value={formatPct(tax.combinedRate)}
          accent={COLORS.text}
        />
        <HeroCard
          label="Take-home"
          value={formatMoneyFull(tax.afterTaxIncome)}
          accent={COLORS.kept}
        />
      </div>

      <div style={{ width: "100%", marginLeft: '340px', minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.text,
            lineHeight: 1.5,
            marginBottom: 10,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Total Income of {formatMoneyFull(totalIncome)}, <span style={{color: COLORS.kept}}>you keep {formatMoneyFull(tax.afterTaxIncome)} ({formatPct(keepPct / 100)})</span>  and <span style={{color: COLORS.tax}}>owe {formatMoneyFull(tax.totalTax)} in taxes ({formatPct(taxPct / 100)})</span>
        </div>
        <div
          style={{
            width: "100%",
            height: 18,
            borderRadius: 999,
            background: COLORS.border,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(100, keepPct))}%`,
              background: COLORS.kept,
            }}
          />
          <div
            style={{
              width: `${Math.max(0, Math.min(100, taxPct))}%`,
              background: COLORS.tax,
            }}
          />
        </div>
      </div>
    </div>
  );
}