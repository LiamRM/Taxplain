// ============================================================================
// FICA (PAYROLL TAX) CALCULATIONS
//
// FICA only applies to wage/ordinary income. Capital gains are exempt.
// Employee share:
//   - Social Security: 6.2% on wages up to the annual wage base
//   - Medicare:        1.45% on all wages (no cap)
//   - Additional Medicare: 0.9% on wages above the filing-status threshold
// ============================================================================

import { FICA_BY_YEAR } from "../data/payrollAndSalesTax.js";

const DEFAULT_YEAR = 2025;

/**
 * Compute FICA tax on a given amount of ordinary wage income.
 *
 * @param {object} args
 * @param {number} args.wages
 * @param {string} args.filing
 * @param {number} [args.year]
 */
export function computeFica({ wages, filing, year = DEFAULT_YEAR }) {
  const yr = FICA_BY_YEAR[year] ? year : DEFAULT_YEAR;
  const params = FICA_BY_YEAR[yr];

  if (wages <= 0) {
    return {
      year: yr,
      wages: 0,
      ssWageBase: params.ssWageBase,
      socialSecurity: 0,
      medicare: 0,
      additionalMedicare: 0,
      totalTax: 0,
      effectiveRate: 0,
    };
  }

  const ssWages = Math.min(wages, params.ssWageBase);
  const socialSecurity = ssWages * params.ssRate;

  const medicare = wages * params.medicareRate;

  const addThreshold = params.additionalMedicareThreshold[filing];
  const addWages = Math.max(0, wages - addThreshold);
  const additionalMedicare = addWages * params.additionalMedicareRate;

  const totalTax = socialSecurity + medicare + additionalMedicare;

  return {
    year: yr,
    wages,
    ssWageBase: params.ssWageBase,
    socialSecurity,
    medicare,
    additionalMedicare,
    totalTax,
    effectiveRate: wages > 0 ? totalTax / wages : 0,
  };
}