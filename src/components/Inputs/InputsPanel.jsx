import React, { useState, useEffect, useCallback } from "react";
import { COLORS, MONO_STACK } from "../../theme.js";
import { FILING_OPTIONS, YEAR_OPTIONS } from "../../data/federalBrackets.js";
import { STATE_OPTIONS } from "../../data/stateBrackets.js";
import LabeledSelect from "./LabeledSelect.jsx";
import MixSlider from "./MixSlider.jsx";
import DollarField from "./DollarField.jsx";

const GROSS_MIN = 0;
const GROSS_MAX = 5_000_000;
const SPEND_MIN = 0;
const SPEND_MAX = 200_000;

/**
 * The full inputs panel.
 *
 * Props (canonical state from parent):
 *   year, filing, state, regularPct, gross, taxableSpending
 *
 * Props (callbacks):
 *   onYearChange, onFilingChange, onStateChange, onRegularPctChange,
 *   onGrossChange, onTaxableSpendingChange
 *
 * Props (visual):
 *   flat - if true, drop the outer card styling (used inside the sidebar)
 */
export default function InputsPanel({
  year,
  filing,
  state,
  regularPct,
  gross,
  taxableSpending,
  onYearChange,
  onFilingChange,
  onStateChange,
  onRegularPctChange,
  onGrossChange,
  onTaxableSpendingChange,
  flat = false,
}) {
  // Local string state for the dollar inputs so the user can type freely.
  const [regStr, setRegStr] = useState("");
  const [cgStr, setCgStr] = useState("");
  const [spendStr, setSpendStr] = useState("");
  // Editable gross income display above the slider (its own input field).
  const [grossStr, setGrossStr] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [sliderOpen, setSliderOpen] = useState(false);

  // Sync canonical → local strings whenever NOT being edited.
  useEffect(() => {
    const reg = Math.round(gross * (regularPct / 100));
    const cg = Math.round(gross * (1 - regularPct / 100));
    if (activeField !== "reg") setRegStr(String(reg));
    if (activeField !== "cg") setCgStr(String(cg));
    if (activeField !== "gross") setGrossStr(String(Math.round(gross)));
  }, [gross, regularPct, activeField]);

  useEffect(() => {
    if (activeField !== "spend") setSpendStr(String(Math.round(taxableSpending)));
  }, [taxableSpending, activeField]);

  // Commit the ordinary/cap-gains dollar pair back to gross + regularPct.
  const commitDollars = useCallback(
    (regValue, cgValue) => {
      const reg = Math.max(0, Number(regValue) || 0);
      const cg = Math.max(0, Number(cgValue) || 0);
      const total = reg + cg;
      if (total <= 0) {
        onGrossChange(0);
        return;
      }
      const clamped = Math.min(total, GROSS_MAX);
      const newPct = Math.round((reg / total) * 100);
      onGrossChange(clamped);
      onRegularPctChange(Math.min(100, Math.max(0, newPct)));
    },
    [onGrossChange, onRegularPctChange]
  );

  const handleRegBlur = () => {
    setActiveField(null);
    commitDollars(regStr, cgStr);
  };
  const handleCgBlur = () => {
    setActiveField(null);
    commitDollars(regStr, cgStr);
  };
  const handleSpendBlur = () => {
    setActiveField(null);
    const v = Math.max(0, Math.min(SPEND_MAX, Number(spendStr) || 0));
    onTaxableSpendingChange(v);
  };
  const handleGrossBlur = () => {
    setActiveField(null);
    const v = Math.max(GROSS_MIN, Math.min(GROSS_MAX, Number(grossStr) || 0));
    onGrossChange(v);
  };

  const spendPct = gross > 0 ? Math.round((taxableSpending / gross) * 100) : 0;

  const ToggleArrow = ({ open }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.textFaint}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      {open ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
    </svg>
  );

  return (
    <div
      style={
        flat
          ? { padding: 0 }
          : {
              marginBottom: 18,
              padding: "16px 18px",
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
            }
      }
    >
      {/* Row 1: dropdowns — stacked vertically in flat mode (narrow sidebar) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: flat ? "1fr" : "minmax(160px, 1fr) minmax(160px, 1fr) minmax(160px, 1fr)",
          gap: flat ? 14 : 18,
          alignItems: "end",
        }}
      >
        <LabeledSelect
          label="Tax Year"
          value={year}
          onChange={(v) => onYearChange(Number(v))}
          options={YEAR_OPTIONS}
        />
        <LabeledSelect
          label="Filing Status"
          value={filing}
          onChange={onFilingChange}
          options={FILING_OPTIONS}
        />
        <LabeledSelect
          label="State"
          value={state}
          onChange={onStateChange}
          options={STATE_OPTIONS}
        />
      </div>

      {/* Row 2: ordinary + cap-gains dollar inputs */}
      <div
        style={{
          marginTop: 14,
          // paddingTop: 14,
          // borderTop: `1px dashed ${COLORS.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "flex-end",
          fontSize: 13,
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: 'row',
            width: '100%',
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
            Enter Gross Income
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: 'row',
            justifyContent: "space-between",
            width: '100%',
          }}
        >

        <DollarField
          label="Ordinary Income"
          color={COLORS.ordinary}
          valueStr={regStr}
          onChangeStr={(v) => {
            setActiveField("reg");
            setRegStr(v);
          }}
          onCommit={handleRegBlur}
        />
        <DollarField
          label="Capital Gains Income"
          color={COLORS.capGains}
          valueStr={cgStr}
          onChangeStr={(v) => {
            setActiveField("cg");
            setCgStr(v);
          }}
          onCommit={handleCgBlur}
        />

        </div>
      </div>

      {/* Row 3: taxable spending — drives sales tax */}
      <div style={{
        marginTop: 14,
          // paddingTop: 14,
          // borderTop: `1px dashed ${COLORS.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "flex-end",
          fontSize: 13,
          flexDirection: "row",
      }}>
        <div
          style={{
            display: "flex",
            flexDirection: 'row',
            width: '100%',
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
            Enter Taxable Spending
          </span>
        </div>
        <DollarField
            label="Taxable Spend (Annual)"
            color={COLORS.spending}
            valueStr={spendStr}
            onChangeStr={(v) => {
              setActiveField("spend");
              setSpendStr(v);
            }}
            onCommit={handleSpendBlur}
          />
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11.5,
              color: COLORS.textFaint,
              maxWidth: 380,
              lineHeight: 1.5,
            }}
          >
            Estimate dollars you spend on sales-taxable purchases per year.
            Most groceries and prescriptions are exempt in many states; rent
            and services typically aren't taxed.
          </p>
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: `1px dashed ${COLORS.border}`,
        }}
      >
        <button
          type="button"
          onClick={() => setSliderOpen((open) => !open)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            fontFamily: MONO_STACK,
            fontSize: 12.5,
            fontWeight: 700,
            color: COLORS.text,
            // background: COLORS.bg,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            textAlign: "left",
            outline: "none",
          }}
        >
          <span>Slider Inputs</span>
          <ToggleArrow open={sliderOpen} />
        </button>

        {sliderOpen && (
          <div style={{ marginTop: 14, display: "grid", gap: 18 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  gap: 10,
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
                  Gross Income
                </span>
                <EditableDollar
                  valueStr={grossStr}
                  onChangeStr={(v) => {
                    setActiveField("gross");
                    setGrossStr(v);
                  }}
                  onCommit={handleGrossBlur}
                />
              </div>
              <input
                type="range"
                min={GROSS_MIN}
                max={GROSS_MAX}
                step={1000}
                value={gross}
                onChange={(e) => onGrossChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: COLORS.text }}
              />
            </div>

            <div>
              <MixSlider regularPct={regularPct} onChange={onRegularPctChange} />
            </div>

            <div style={{ paddingTop: 14, borderTop: `1px dashed ${COLORS.border}` }}>
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
                  Annual taxable spending
                </span>
                <span style={{ fontSize: 12.5, color: COLORS.textSubtle }}>
                  <strong style={{ color: COLORS.spending, fontFamily: MONO_STACK }}>
                    ${Math.round(taxableSpending).toLocaleString()}
                  </strong>{" "}
                  <span style={{ color: COLORS.textFaint }}>({spendPct}% of gross)</span>
                </span>
              </div>

              <input
                type="range"
                min={SPEND_MIN}
                max={SPEND_MAX}
                step={500}
                value={Math.min(taxableSpending, SPEND_MAX)}
                onChange={(e) => onTaxableSpendingChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: COLORS.spending }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline editable dollar field used for the gross income label above the
 * slider. Visually similar to the surrounding text (large bold numbers in
 * the mono font) but accepts keyboard input on click.
 */
function EditableDollar({ valueStr, onChangeStr, onCommit }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 2,
        background: COLORS.bg,
        border: `1px solid ${COLORS.borderStrong}`,
        borderRadius: 6,
        padding: "2px 6px 2px 8px",
      }}
    >
      <span
        style={{
          color: COLORS.textSubtle,
          fontFamily: MONO_STACK,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={valueStr}
        onChange={(e) => onChangeStr(e.target.value.replace(/[^0-9.]/g, ""))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        style={{
          fontFamily: MONO_STACK,
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.text,
          border: "none",
          outline: "none",
          background: "transparent",
          width: 90,
          padding: 0,
          textAlign: "right",
        }}
      />
    </div>
  );
}