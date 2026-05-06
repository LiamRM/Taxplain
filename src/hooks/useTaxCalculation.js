import { useMemo } from "react";
import { computeFederalTax } from "../lib/federalTax.js";
import { computeStateTax } from "../lib/stateTax.js";
import { computeFica } from "../lib/ficaTax.js";
import { computeSalesTax } from "../lib/salesTax.js";

/**
 * Compute the full tax picture: federal income, state income, FICA payroll,
 * and sales tax on annual taxable spending. Memoized — recomputes only
 * when inputs change.
 *
 * @param {object} inputs
 * @param {number} inputs.gross
 * @param {number} inputs.regularPct
 * @param {string} inputs.filing
 * @param {string} inputs.state
 * @param {number} inputs.taxableSpending
 * @param {number} inputs.year - tax year (e.g. 2024, 2025)
 */
export function useTaxCalculation({
  gross,
  regularPct,
  filing,
  state,
  taxableSpending,
  year,
}) {
  return useMemo(() => {
    const federal = computeFederalTax({ gross, regularPct, filing, year });
    const stateRes = computeStateTax({ gross, regularPct, state });

    const wages = gross * (regularPct / 100);
    const fica = computeFica({ wages, filing, year });

    const sales = computeSalesTax({ state, taxableSpending });

    const totalTax =
      federal.totalTax + stateRes.totalTax + fica.totalTax + sales.totalTax;
    const afterTaxIncome = gross - totalTax;
    const combinedRate = gross > 0 ? totalTax / gross : 0;

    return {
      federal,
      state: stateRes,
      fica,
      sales,
      totalTax,
      afterTaxIncome,
      combinedRate,
    };
  }, [gross, regularPct, filing, state, taxableSpending, year]);
}