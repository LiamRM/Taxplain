// ============================================================================
// STATE TAX CALCULATIONS
//
// State income tax is computed in parallel with federal tax. We use the same
// "ordinary income" definition: state taxable income = ordinary gross minus
// the state standard deduction (clamped at zero).
//
// Most states do not give preferential treatment to long-term capital gains,
// so by default we tax cap gains at the same rate as ordinary income at the
// state level. (Exceptions like WA's cap gains tax and a handful of states
// with carve-outs are out of scope for this teaching tool.)
// ============================================================================

import { applyBrackets } from "./federalTax.js";
import { STATE_TAX } from "../data/stateBrackets.js";

/**
 * Compute state income tax for a given gross income, mix, and state.
 *
 * @param {object} args
 * @param {number} args.gross - total gross income
 * @param {number} args.regularPct - 0..100, ordinary share of gross
 * @param {keyof STATE_TAX} args.state - state code (e.g. "CA")
 * @returns {{
 *   state: string,
 *   stateName: string,
 *   type: "progressive" | "flat" | "none",
 *   stateTaxable: number,
 *   totalTax: number,
 *   effectiveRate: number,
 *   perBracket: Array<{rate, taxedAmount, taxOnBracket, lower, upper}> | null,
 *   flatRate: number | null,
 * }}
 */
export function computeStateTax({ gross, regularPct, state }) {
  const info = STATE_TAX[state];

  // No-income-tax states: nothing to do.
  if (!info || info.type === "none") {
    return {
      state,
      stateName: info ? info.name : state,
      type: "none",
      stateTaxable: 0,
      totalTax: 0,
      effectiveRate: 0,
      perBracket: null,
      flatRate: null,
    };
  }

  // For state purposes, treat all gross income as taxable (after state
  // standard deduction). Most states do not offer LTCG preferential rates.
  const stdDed = info.standardDeduction || 0;
  const stateTaxable = Math.max(0, gross - stdDed);

  if (info.type === "flat") {
    const totalTax = stateTaxable * info.rate;
    return {
      state,
      stateName: info.name,
      type: "flat",
      stateTaxable,
      totalTax,
      effectiveRate: gross > 0 ? totalTax / gross : 0,
      perBracket: null,
      flatRate: info.rate,
    };
  }

  // Progressive
  const result = applyBrackets(stateTaxable, info.brackets);
  return {
    state,
    stateName: info.name,
    type: "progressive",
    stateTaxable,
    totalTax: result.totalTax,
    effectiveRate: gross > 0 ? result.totalTax / gross : 0,
    perBracket: result.perBracket,
    flatRate: null,
  };
}
