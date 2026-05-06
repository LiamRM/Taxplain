import React from "react";
import { COLORS } from "../../theme.js";

/**
 * Methodology / disclaimer footnote rendered at the bottom of the main
 * scrollable area.
 */
export default function Footnote() {
  return (
    <p
      style={{
        marginTop: 18,
        fontSize: 11.5,
        color: COLORS.textFaint,
        lineHeight: 1.55,
      }}
    >
      Federal income: 2025 brackets per IRS Rev. Proc. 2024-40 with OBBB Act
      standard deduction adjustments. FICA: employee share — 6.2% Social
      Security up to $176,100, 1.45% Medicare on all wages, 0.9% Additional
      Medicare above $200k single / $250k MFJ. State income: simplified
      single-filer schedules. Sales tax: 2025 average combined state-and-local
      rate (Tax Foundation). Excludes NIIT, AMT, credits, itemized deductions,
      and local income taxes.
    </p>
  );
}