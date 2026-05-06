// ============================================================================
// SALES TAX CALCULATION
//
// Sales tax is paid out of after-tax dollars on taxable purchases. Unlike
// income tax, the user has direct control: more spending on taxable goods
// means more sales tax. This calculation needs an explicit "taxable
// spending" estimate from the user.
// ============================================================================

import { SALES_TAX_RATE } from "../data/payrollAndSalesTax.js";

/**
 * Compute estimated annual sales tax for a given state and spending amount.
 *
 * @param {object} args
 * @param {string} args.state           - 2-letter state code
 * @param {number} args.taxableSpending - dollars spent on taxable purchases per year
 * @returns {{
 *   state: string,
 *   rate: number,
 *   taxableSpending: number,
 *   totalTax: number,
 * }}
 */
export function computeSalesTax({ state, taxableSpending }) {
  const rate = SALES_TAX_RATE[state] ?? 0;
  const spending = Math.max(0, taxableSpending || 0);
  return {
    state,
    rate,
    taxableSpending: spending,
    totalTax: spending * rate,
  };
}