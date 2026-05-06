import React from "react";
import { COLORS, MONO_STACK } from "../../theme.js";

/**
 * Slider that controls the ordinary-vs-capital-gains percentage split.
 * Values are 0..100 representing the ordinary share.
 */
export default function MixSlider({ regularPct, onChange }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.textSubtle,
            fontWeight: 600,
          }}
        >
          Income Mix
        </span>
        <span style={{ fontSize: 12.5, color: COLORS.textSubtle }}>
          <strong style={{ color: COLORS.ordinary }}>{regularPct}% ordinary</strong>
          {" "}/{" "}
          <strong style={{ color: COLORS.capGains }}>{100 - regularPct}% capital gains</strong>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11.5, color: COLORS.ordinary, fontWeight: 600 }}>Ordinary</span>
        <input
          type="range"
          min={0}
          max={100}
          value={regularPct}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: COLORS.ordinary }}
        />
        <span style={{ fontSize: 11.5, color: COLORS.capGains, fontWeight: 600 }}>Cap gains</span>
      </div>
    </div>
  );
}
