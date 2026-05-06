// ============================================================================
// FEDERAL TAX DATA — keyed by tax year (2024, 2025)
//
// Sources:
//   - 2024: IRS Rev. Proc. 2023-34
//   - 2025: IRS Rev. Proc. 2024-40 with One Big Beautiful Bill Act adjustments
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────
// 2024
// ─────────────────────────────────────────────────────────────────────────
const STD_DED_2024 = {
  single: 14_600,
  mfj: 29_200,
  hoh: 21_900,
};

const ORDINARY_2024 = {
  single: [
    [11600, 0.10],
    [47150, 0.12],
    [100525, 0.22],
    [191950, 0.24],
    [243725, 0.32],
    [609350, 0.35],
    [Infinity, 0.37],
  ],
  mfj: [
    [23200, 0.10],
    [94300, 0.12],
    [201050, 0.22],
    [383900, 0.24],
    [487450, 0.32],
    [731200, 0.35],
    [Infinity, 0.37],
  ],
  hoh: [
    [16550, 0.10],
    [63100, 0.12],
    [100500, 0.22],
    [191950, 0.24],
    [243700, 0.32],
    [609350, 0.35],
    [Infinity, 0.37],
  ],
};

const CAPGAINS_2024 = {
  single: [
    [47025, 0.0],
    [518900, 0.15],
    [Infinity, 0.20],
  ],
  mfj: [
    [94050, 0.0],
    [583750, 0.15],
    [Infinity, 0.20],
  ],
  hoh: [
    [63000, 0.0],
    [551350, 0.15],
    [Infinity, 0.20],
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// 2025
// ─────────────────────────────────────────────────────────────────────────
const STD_DED_2025 = {
  single: 15_750,
  mfj: 31_500,
  hoh: 23_625,
};

const ORDINARY_2025 = {
  single: [
    [11925, 0.10],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ],
  mfj: [
    [23850, 0.10],
    [96950, 0.12],
    [206700, 0.22],
    [394600, 0.24],
    [501050, 0.32],
    [751600, 0.35],
    [Infinity, 0.37],
  ],
  hoh: [
    [17000, 0.10],
    [64850, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250500, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ],
};

const CAPGAINS_2025 = {
  single: [
    [48350, 0.0],
    [533400, 0.15],
    [Infinity, 0.20],
  ],
  mfj: [
    [96700, 0.0],
    [600050, 0.15],
    [Infinity, 0.20],
  ],
  hoh: [
    [64750, 0.0],
    [566700, 0.15],
    [Infinity, 0.20],
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Year-keyed lookups — calculation code reads from these.
// ─────────────────────────────────────────────────────────────────────────
export const FEDERAL_BY_YEAR = {
  2024: {
    standardDeduction: STD_DED_2024,
    ordinaryBrackets: ORDINARY_2024,
    capGainsBrackets: CAPGAINS_2024,
  },
  2025: {
    standardDeduction: STD_DED_2025,
    ordinaryBrackets: ORDINARY_2025,
    capGainsBrackets: CAPGAINS_2025,
  },
};

export const DEFAULT_YEAR = 2025;

// ─────────────────────────────────────────────────────────────────────────
// Filing status options (don't change year over year).
// ─────────────────────────────────────────────────────────────────────────
export const FILING_LABEL = {
  single: "Single",
  mfj: "Married Filing Jointly",
  hoh: "Head of Household",
};

export const FILING_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married Filing Jointly" },
  { value: "hoh", label: "Head of Household" },
];

export const YEAR_OPTIONS = [
  { value: 2025, label: "2025" },
  { value: 2024, label: "2024" },
];