// ============================================================================
// FEDERAL TAX CALCULATIONS
//
// All calculations follow IRS bracket rules: ordinary income is taxed first
// using progressive marginal brackets; long-term capital gains are then
// "stacked on top" of ordinary taxable income and taxed at 0/15/20% based
// on the position of total taxable income within the LTCG brackets.
// ============================================================================

import { FEDERAL_BY_YEAR, DEFAULT_YEAR } from "../data/federalBrackets.js";

/**
 * Apply a progressive bracket schedule to a taxable amount. Returns total
 * tax plus a per-bracket breakdown for charting.
 */
export function applyBrackets(taxable, brackets) {
  const perBracket = [];

  if (taxable <= 0) {
    let prev = 0;
    for (const [upper, rate] of brackets) {
      perBracket.push({ rate, taxedAmount: 0, taxOnBracket: 0, lower: prev, upper });
      prev = upper;
    }
    return { totalTax: 0, perBracket };
  }

  let prev = 0;
  let totalTax = 0;

  for (const [upper, rate] of brackets) {
    const top = Math.min(taxable, upper);
    const taxedAmount = Math.max(0, top - prev);
    const taxOnBracket = taxedAmount * rate;

    totalTax += taxOnBracket;
    perBracket.push({ rate, taxedAmount, taxOnBracket, lower: prev, upper });

    prev = upper;
    if (taxable <= upper) {
      while (perBracket.length < brackets.length) {
        const [u, r] = brackets[perBracket.length];
        perBracket.push({ rate: r, taxedAmount: 0, taxOnBracket: 0, lower: prev, upper: u });
        prev = u;
      }
      break;
    }
  }

  return { totalTax, perBracket };
}

/**
 * Apply LTCG brackets, where gains stack on top of ordinary taxable income.
 * The upper bounds in cgBrackets are TOTAL taxable income thresholds, so
 * the cursor starts at `ordinaryTaxable` (where the next dollar of gains
 * lands).
 */
export function applyCapGainsBrackets(ordinaryTaxable, gains, cgBrackets) {
  const perBracket = [];

  if (gains <= 0) {
    for (const [upper, rate] of cgBrackets) {
      perBracket.push({ rate, taxedAmount: 0, taxOnBracket: 0, lower: ordinaryTaxable, upper });
    }
    return { totalTax: 0, perBracket };
  }

  let totalTax = 0;
  let remaining = gains;
  let cursor = ordinaryTaxable;

  for (const [upper, rate] of cgBrackets) {
    const room = Math.max(0, upper - cursor);
    const taxedAmount = Math.min(remaining, room);
    const taxOnBracket = taxedAmount * rate;

    totalTax += taxOnBracket;
    perBracket.push({ rate, taxedAmount, taxOnBracket, lower: cursor, upper });

    cursor += taxedAmount;
    remaining -= taxedAmount;
  }

  return { totalTax, perBracket };
}

/**
 * Run the full federal calculation for a given gross income, mix, filing
 * status, and tax year. Falls back to DEFAULT_YEAR if the requested year
 * has no bracket data.
 */
export function computeFederalTax({ gross, regularPct, filing, year = DEFAULT_YEAR }) {
  const yr = FEDERAL_BY_YEAR[year] ? year : DEFAULT_YEAR;
  const { standardDeduction, ordinaryBrackets, capGainsBrackets } = FEDERAL_BY_YEAR[yr];

  const stdDed = standardDeduction[filing];
  const regularGross = gross * (regularPct / 100);
  const capGainsGross = gross * (1 - regularPct / 100);

  // Standard deduction reduces ordinary income first.
  const ordinaryTaxable = Math.max(0, regularGross - stdDed);
  const deductionRemaining = Math.max(0, stdDed - regularGross);
  // If deduction exceeds ordinary income, leftover reduces cap gains.
  const capGainsTaxable = Math.max(0, capGainsGross - deductionRemaining);

  const ordResult = applyBrackets(ordinaryTaxable, ordinaryBrackets[filing]);
  const cgResult = applyCapGainsBrackets(
    ordinaryTaxable,
    capGainsTaxable,
    capGainsBrackets[filing]
  );

  const totalTax = ordResult.totalTax + cgResult.totalTax;

  return {
    year: yr,
    gross,
    regularGross,
    capGainsGross,
    stdDed,
    deductionUsed: Math.min(stdDed, gross),
    ordinaryTaxable,
    capGainsTaxable,
    ordResult,
    cgResult,
    totalTax,
    avgRate: gross > 0 ? totalTax / gross : 0,
  };
}