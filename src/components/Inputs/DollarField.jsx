import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";

/**
 * A focused dollar input that holds its value as a string while the user is
 * editing, so partial inputs ("12", "12345.") don't get clobbered. The
 * parent owns the canonical numeric state and applies it on blur/Enter.
 */
export default function DollarField({
  label,
  color,
  valueStr,
  onChangeStr,
  onCommit,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontSize: 12,
        color: COLORS.text,
        fontWeight: 600,
      }}
    >
      <span style={{ color }}>{label}</span>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: `1px solid ${COLORS.borderStrong}`,
          borderRadius: 6,
          background: COLORS.bg,
          paddingLeft: 8,
        }}
      >
        <span style={{ color: COLORS.textSubtle, fontFamily: MONO_STACK, fontSize: 13 }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={valueStr}
          onChange={(e) => onChangeStr(e.target.value.replace(/[^0-9.]/g, ""))}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          style={{
            fontFamily: MONO_STACK,
            fontSize: 13,
            padding: "6px 8px",
            border: "none",
            outline: "none",
            background: "transparent",
            color: COLORS.text,
            width: 110,
          }}
        />
      </div>
    </label>
  );
}
