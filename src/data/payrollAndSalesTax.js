// ============================================================================
// FICA CONSTANTS — year-keyed
//
// FICA is the federal payroll tax. The Social Security wage base is
// indexed to wage growth and rises every year. Medicare and Additional
// Medicare rates have not changed.
//
//   - 2024 SS wage base: $168,600 (SSA Fact Sheet 2024)
//   - 2025 SS wage base: $176,100 (SSA Fact Sheet 2025)
//
// The Additional Medicare thresholds ($200k single / $250k MFJ) are NOT
// indexed for inflation.
// ============================================================================

const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200_000,
  mfj: 250_000,
  hoh: 200_000,
};

export const FICA_BY_YEAR = {
  2024: {
    ssRate: 0.062,
    ssWageBase: 168_600,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: ADDITIONAL_MEDICARE_THRESHOLD,
  },
  2025: {
    ssRate: 0.062,
    ssWageBase: 176_100,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: ADDITIONAL_MEDICARE_THRESHOLD,
  },
};

// ============================================================================
// STATE + LOCAL COMBINED SALES TAX RATES (Tax Foundation 2025 estimates)
//
// These don't change much year over year and are simplified to a single
// average per state. We use the same table for all supported tax years.
// ============================================================================

export const SALES_TAX_RATE = {
  AL: 0.0925, AK: 0.0182, AZ: 0.0838, AR: 0.0944, CA: 0.0882,
  CO: 0.0781, CT: 0.0635, DE: 0.0,    DC: 0.0600, FL: 0.0700,
  GA: 0.0738, HI: 0.0450, ID: 0.0602, IL: 0.0888, IN: 0.0700,
  IA: 0.0694, KS: 0.0866, KY: 0.0600, LA: 0.0956, ME: 0.0550,
  MD: 0.0600, MA: 0.0625, MI: 0.0600, MN: 0.0810, MS: 0.0707,
  MO: 0.0838, MT: 0.0,    NE: 0.0697, NV: 0.0823, NH: 0.0,
  NJ: 0.0660, NM: 0.0762, NY: 0.0853, NC: 0.0700, ND: 0.0704,
  OH: 0.0724, OK: 0.0899, OR: 0.0,    PA: 0.0634, RI: 0.0700,
  SC: 0.0744, SD: 0.0640, TN: 0.0955, TX: 0.0820, UT: 0.0744,
  VT: 0.0636, VA: 0.0577, WA: 0.0938, WV: 0.0657, WI: 0.0570,
  WY: 0.0536,
};