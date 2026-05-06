import React from "react";
import { COLORS } from "../../theme.js";
import { formatMoneyFull, formatPct } from "../../lib/format.js";
import HeroCard from "../Layout/HeroCard.jsx";

/**
 * Six summary cards: Federal, FICA, State income, Sales tax, Combined,
 * Take-home. Responsive grid: 6 cols on wide screens, 3 on medium, 2 on
 * narrow.
 *
 * `availableWidth` is the width of the container this row will live in
 * (the main panel's width, not the whole window) — it's what determines
 * how many columns to use.
 */
export default function SummaryRow({ tax, availableWidth }) {
  const cols =
    availableWidth < 600
      ? "1fr 1fr"
      : availableWidth < 920
        ? "repeat(3, 1fr)"
        : "repeat(6, 1fr)";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        gap: 10,
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
        label={`State income (${tax.state.state})`}
        value={tax.state.type === "none" ? "—" : formatMoneyFull(tax.state.totalTax)}
        accent={COLORS.state}
      />
      <HeroCard
        label={`Sales tax (${formatPct(tax.sales.rate, 2)})`}
        value={formatMoneyFull(tax.sales.totalTax)}
        accent={COLORS.sales}
      />
      <HeroCard
        label="Combined effective"
        value={formatPct(tax.combinedRate)}
        accent={COLORS.text}
      />
      <HeroCard
        label="Take-home"
        value={formatMoneyFull(tax.afterTaxIncome)}
        accent={COLORS.kept}
      />
    </div>
  );
}