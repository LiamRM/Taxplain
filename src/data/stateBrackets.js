// ============================================================================
// 2025 STATE INCOME TAX DATA
//
// We support two shapes:
//   - "progressive": full bracket schedule, like federal (used for the top 10
//     populous states with progressive systems).
//   - "flat": single rate (used for flat-tax states and most others).
//   - "none": no income tax.
//
// Each progressive state's brackets are simplified to the SINGLE filer
// schedule — most states use proportionally-doubled brackets for MFJ but for
// a teaching tool the single schedule keeps the visualization legible.
//
// State standard deductions are included where applicable; flat-tax states
// often provide a personal exemption instead, which is approximated here.
//
// Sources: state tax department publications, Tax Foundation 2025 summaries.
// These are simplified for visualization purposes.
// ============================================================================

export const STATE_TAX = {
  // ─── No income tax ─────────────────────────────────────────────────────
  AK: { name: "Alaska",       type: "none" },
  FL: { name: "Florida",      type: "none" },
  NV: { name: "Nevada",       type: "none" },
  NH: { name: "New Hampshire", type: "none" }, // wage income only
  SD: { name: "South Dakota", type: "none" },
  TN: { name: "Tennessee",    type: "none" },
  TX: { name: "Texas",        type: "none" },
  WA: { name: "Washington",   type: "none" },
  WY: { name: "Wyoming",      type: "none" },

  // ─── Top 10 populous progressive states (full brackets) ────────────────
  CA: {
    name: "California",
    type: "progressive",
    standardDeduction: 5540,
    brackets: [
      [10756, 0.01],
      [25499, 0.02],
      [40245, 0.04],
      [55866, 0.06],
      [70606, 0.08],
      [360659, 0.093],
      [432787, 0.103],
      [721314, 0.113],
      [Infinity, 0.123],
    ],
  },
  NY: {
    name: "New York",
    type: "progressive",
    standardDeduction: 8000,
    brackets: [
      [8500, 0.04],
      [11700, 0.045],
      [13900, 0.0525],
      [80650, 0.055],
      [215400, 0.06],
      [1077550, 0.0685],
      [5000000, 0.0965],
      [25000000, 0.103],
      [Infinity, 0.109],
    ],
  },
  NJ: {
    name: "New Jersey",
    type: "progressive",
    standardDeduction: 0,
    brackets: [
      [20000, 0.014],
      [35000, 0.0175],
      [40000, 0.035],
      [75000, 0.05525],
      [500000, 0.0637],
      [1000000, 0.0897],
      [Infinity, 0.1075],
    ],
  },
  VA: {
    name: "Virginia",
    type: "progressive",
    standardDeduction: 8500,
    brackets: [
      [3000, 0.02],
      [5000, 0.03],
      [17000, 0.05],
      [Infinity, 0.0575],
    ],
  },
  GA: {
    name: "Georgia",
    type: "flat",
    rate: 0.0539,
    standardDeduction: 12000,
  },
  OH: {
    name: "Ohio",
    type: "progressive",
    standardDeduction: 0,
    brackets: [
      [26050, 0.0],
      [100000, 0.0275],
      [Infinity, 0.035],
    ],
  },
  PA: {
    name: "Pennsylvania",
    type: "flat",
    rate: 0.0307,
    standardDeduction: 0,
  },
  IL: {
    name: "Illinois",
    type: "flat",
    rate: 0.0495,
    standardDeduction: 2775, // personal exemption
  },
  NC: {
    name: "North Carolina",
    type: "flat",
    rate: 0.0425,
    standardDeduction: 12750,
  },
  OR: {
    name: "Oregon",
    type: "progressive",
    standardDeduction: 2745,
    brackets: [
      [4400, 0.0475],
      [11050, 0.0675],
      [125000, 0.0875],
      [Infinity, 0.099],
    ],
  },

  // ─── Remaining states (flat or simplified) ─────────────────────────────
  AL: { name: "Alabama",       type: "flat", rate: 0.05,   standardDeduction: 3000 },
  AZ: { name: "Arizona",       type: "flat", rate: 0.025,  standardDeduction: 14600 },
  AR: { name: "Arkansas",      type: "flat", rate: 0.039,  standardDeduction: 2340 },
  CO: { name: "Colorado",      type: "flat", rate: 0.044,  standardDeduction: 14600 },
  CT: { name: "Connecticut",   type: "flat", rate: 0.055,  standardDeduction: 0 },
  DE: { name: "Delaware",      type: "flat", rate: 0.066,  standardDeduction: 3250 },
  HI: { name: "Hawaii",        type: "flat", rate: 0.064,  standardDeduction: 4400 },
  ID: { name: "Idaho",         type: "flat", rate: 0.053,  standardDeduction: 14600 },
  IN: { name: "Indiana",       type: "flat", rate: 0.03,   standardDeduction: 1000 },
  IA: { name: "Iowa",          type: "flat", rate: 0.038,  standardDeduction: 2210 },
  KS: { name: "Kansas",        type: "flat", rate: 0.0525, standardDeduction: 3500 },
  KY: { name: "Kentucky",      type: "flat", rate: 0.04,   standardDeduction: 3270 },
  LA: { name: "Louisiana",     type: "flat", rate: 0.03,   standardDeduction: 4500 },
  ME: { name: "Maine",         type: "flat", rate: 0.0715, standardDeduction: 14600 },
  MD: { name: "Maryland",      type: "flat", rate: 0.0575, standardDeduction: 2400 },
  MA: { name: "Massachusetts", type: "flat", rate: 0.05,   standardDeduction: 0 },
  MI: { name: "Michigan",      type: "flat", rate: 0.0425, standardDeduction: 5400 },
  MN: { name: "Minnesota",     type: "flat", rate: 0.0785, standardDeduction: 14575 },
  MS: { name: "Mississippi",   type: "flat", rate: 0.044,  standardDeduction: 2300 },
  MO: { name: "Missouri",      type: "flat", rate: 0.047,  standardDeduction: 14600 },
  MT: { name: "Montana",       type: "flat", rate: 0.059,  standardDeduction: 5540 },
  NE: { name: "Nebraska",      type: "flat", rate: 0.052,  standardDeduction: 8350 },
  NM: { name: "New Mexico",    type: "flat", rate: 0.049,  standardDeduction: 14600 },
  ND: { name: "North Dakota",  type: "flat", rate: 0.025,  standardDeduction: 14600 },
  OK: { name: "Oklahoma",      type: "flat", rate: 0.0475, standardDeduction: 6350 },
  RI: { name: "Rhode Island",  type: "flat", rate: 0.0599, standardDeduction: 10550 },
  SC: { name: "South Carolina", type: "flat", rate: 0.062, standardDeduction: 14600 },
  UT: { name: "Utah",          type: "flat", rate: 0.0455, standardDeduction: 876 },
  VT: { name: "Vermont",       type: "flat", rate: 0.066,  standardDeduction: 7400 },
  WV: { name: "West Virginia", type: "flat", rate: 0.0482, standardDeduction: 0 },
  WI: { name: "Wisconsin",     type: "flat", rate: 0.0653, standardDeduction: 13230 },
  DC: { name: "Washington DC", type: "flat", rate: 0.0875, standardDeduction: 14600 },
};

// Sorted list for the dropdown (alphabetical by full name).
export const STATE_OPTIONS = Object.entries(STATE_TAX)
  .map(([code, info]) => ({ value: code, label: info.name }))
  .sort((a, b) => a.label.localeCompare(b.label));
