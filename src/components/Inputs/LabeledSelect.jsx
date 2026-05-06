import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";

/**
 * Generic labeled select. `options` is `[{ value, label }, ...]`.
 */
export default function LabeledSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: MONO_STACK,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.textSubtle,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: "inherit",
          fontSize: 14,
          padding: "8px 10px",
          border: `1px solid ${COLORS.borderStrong}`,
          background: COLORS.bg,
          cursor: "pointer",
          width: "100%",
          borderRadius: 6,
          color: COLORS.text,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
