// ============================================================================
// FLOW MODEL
//
// Pure logic for building Sankey-style flow graphs from a tax calculation.
// Every node and link carries a `tooltip` string — a short, plain-English
// explanation displayed in the tooltip bar at the top of the page when
// the user hovers over it.
//
// Tooltip percentages are SOURCE-RELATIVE: "$X (Y% of Source Node) flows
// to Target Node". This makes the diagram act like a teaching tool: at
// every step the user learns what fraction of the upstream amount is
// being routed where.
// ============================================================================

import { COLORS } from "../../theme.js";

const r = (n) => Math.round(n);

// ─────────────────────────────────────────────────────────────────────────
// Tooltip helpers
// ─────────────────────────────────────────────────────────────────────────

/** Format a dollar amount as a clean string ($12,345 — no decimals). */
function fmt(n) {
  return `$${r(n).toLocaleString()}`;
}

/** Format a fraction as a percentage with sensible precision. */
function pctOf(part, whole) {
  if (whole <= 0) return "0%";
  const pct = (part / whole) * 100;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(2)}%`;
}

/** Format a tax bracket rate (e.g. 0.22 → "22%"). */
function rateLabel(rate) {
  return `${(rate * 100).toFixed(rate < 0.01 ? 2 : rate < 0.1 ? 1 : 0)}%`;
}

/**
 * Build a node tooltip. Format: "Node Name: $X — short description".
 */
function nodeTooltip(name, value, description) {
  return `${name}: ${fmt(value)}${description ? ` — ${description}` : ""}`;
}

/**
 * Build a link tooltip. Format:
 *   "$X (Y% of <source>) <verb phrase> <target>"
 * e.g. "$100,000 (66.5% of Gross Income) flows to Federal Taxable Income"
 */
function linkTooltip(amount, source, sourceValue, verb, target) {
  return `${fmt(amount)} (${pctOf(amount, sourceValue)} of ${source}) ${verb} ${target}`;
}

// ============================================================================
// FEDERAL INCOME TAX GRAPH
// ============================================================================
//
// Columns:
//   0. SOURCES   — Ordinary income, Capital gains
//   1. GROSS     — combined "Gross income" node
//   2. SPLIT     — Federal taxable · Std. deduction
//   3. BRACKETS  — Federal ordinary brackets · LTCG brackets
//   4. OUTCOMES  — Federal income tax · After federal (kept)
//
export function buildFederalGraph(federal) {
  const nodes = [];
  const links = [];
  const byCol = [[], [], [], [], []];

  const addNode = (node) => {
    nodes.push(node);
    byCol[node.column].push(node.id);
    return node.id;
  };

  // Display names — used in tooltips so the user sees plain English.
  const NAME = {
    ordIncome: "Ordinary Income",
    cgIncome: "Capital Gains",
    gross: "Gross Income",
    fedTaxable: "Federal Taxable Income",
    fedDed: "Standard Deduction",
    fedTax: "Federal Income Tax",
    afterFed: "After Federal Tax",
  };

  // --- Column 0: sources ---
  const ordinaryGross = federal.regularGross;
  const cgGross = federal.capGainsGross;

  if (ordinaryGross > 0) {
    addNode({
      id: "src-ord",
      label: `Ordinary income · ${fmt(ordinaryGross)}`,
      tooltip: nodeTooltip(NAME.ordIncome, ordinaryGross,
        "wage and self-employment income, taxed at the ordinary marginal rates"),
      value: ordinaryGross,
      color: COLORS.ordinary,
      column: 0,
    });
  }
  if (cgGross > 0) {
    addNode({
      id: "src-cg",
      label: `Capital gains · ${fmt(cgGross)}`,
      tooltip: nodeTooltip(NAME.cgIncome, cgGross,
        "long-term capital gains, taxed at preferential 0/15/20% rates"),
      value: cgGross,
      color: COLORS.capGains,
      column: 0,
    });
  }

  // --- Column 1: gross ---
  const grossId = addNode({
    id: "gross",
    label: `Gross income · ${fmt(federal.gross)}`,
    tooltip: nodeTooltip(NAME.gross, federal.gross,
      "total income before any taxes or deductions"),
    value: federal.gross,
    color: COLORS.text,
    column: 1,
  });

  if (ordinaryGross > 0) {
    links.push({
      source: "src-ord", target: grossId,
      value: ordinaryGross, color: COLORS.ordinary,
      tooltip: linkTooltip(ordinaryGross, NAME.ordIncome, ordinaryGross, "flows into", NAME.gross),
    });
  }
  if (cgGross > 0) {
    links.push({
      source: "src-cg", target: grossId,
      value: cgGross, color: COLORS.capGains,
      tooltip: linkTooltip(cgGross, NAME.cgIncome, cgGross, "flows into", NAME.gross),
    });
  }

  // --- Column 2: federal taxable + deduction ---
  const fedTaxable = federal.ordinaryTaxable + federal.capGainsTaxable;
  const fedDeduction = federal.deductionUsed;

  // Push taxable link FIRST so deduction comes out the bottom of gross.
  const fedTaxableId = addNode({
    id: "fed-taxable",
    label: `Federal taxable · ${fmt(fedTaxable)}`,
    tooltip: nodeTooltip(NAME.fedTaxable, fedTaxable,
      "income subject to federal income tax (after standard deduction)"),
    value: fedTaxable,
    color: COLORS.ordinary,
    column: 2,
  });
  if (fedTaxable > 0) {
    links.push({
      source: grossId, target: fedTaxableId,
      value: fedTaxable, color: COLORS.ordinary,
      tooltip: linkTooltip(fedTaxable, NAME.gross, federal.gross, "is", NAME.fedTaxable),
    });
  }
  if (fedDeduction > 0) {
    addNode({
      id: "fed-deduction",
      label: `Std. deduction · ${fmt(fedDeduction)}`,
      tooltip: nodeTooltip(NAME.fedDed, fedDeduction,
        "exempt from federal income tax — flows straight through to take-home"),
      value: fedDeduction,
      color: COLORS.deduction,
      column: 2,
    });
    links.push({
      source: grossId, target: "fed-deduction",
      value: fedDeduction, color: COLORS.deduction,
      tooltip: linkTooltip(fedDeduction, NAME.gross, federal.gross,
        "is shielded by the", NAME.fedDed),
    });
  }

  // --- Column 3: brackets ---
  federal.ordResult.perBracket.forEach((b, i) => {
    if (b.taxedAmount <= 0) return;
    const id = `fed-ord-${i}`;
    const bracketName = `Federal ${rateLabel(b.rate)} bracket`;
    addNode({
      id,
      label: `Fed ${rateLabel(b.rate)} · ${fmt(b.taxedAmount)}`,
      tooltip: nodeTooltip(bracketName, b.taxedAmount,
        `ordinary income falling between ${fmt(b.lower)} and ${b.upper === Infinity ? "∞" : fmt(b.upper)} taxable, taxed at ${rateLabel(b.rate)}`),
      value: b.taxedAmount,
      color: shade(COLORS.ordinary, i / Math.max(1, federal.ordResult.perBracket.length - 1)),
      column: 3,
      // Stash for outcome links below.
      _bracketName: bracketName,
      _bracketAmount: b.taxedAmount,
      _bracketRate: b.rate,
    });
    links.push({
      source: fedTaxableId, target: id,
      value: b.taxedAmount, color: COLORS.ordinary,
      tooltip: linkTooltip(b.taxedAmount, NAME.fedTaxable, fedTaxable,
        "falls into the", `${bracketName} (taxed at ${rateLabel(b.rate)})`),
    });
  });

  federal.cgResult.perBracket.forEach((b, i) => {
    if (b.taxedAmount <= 0) return;
    const id = `fed-cg-${i}`;
    const bracketName = `LTCG ${rateLabel(b.rate)} bracket`;
    addNode({
      id,
      label: `LTCG ${rateLabel(b.rate)} · ${fmt(b.taxedAmount)}`,
      tooltip: nodeTooltip(bracketName, b.taxedAmount,
        `long-term capital gains taxed at the preferential ${rateLabel(b.rate)} rate`),
      value: b.taxedAmount,
      color: shade(COLORS.capGains, i / 2),
      column: 3,
      _bracketName: bracketName,
      _bracketAmount: b.taxedAmount,
      _bracketRate: b.rate,
    });
    links.push({
      source: fedTaxableId, target: id,
      value: b.taxedAmount, color: COLORS.capGains,
      tooltip: linkTooltip(b.taxedAmount, NAME.fedTaxable, fedTaxable,
        "falls into the", `${bracketName} (taxed at ${rateLabel(b.rate)})`),
    });
  });

  // --- Column 4: outcomes ---
  const fedTaxId = "fed-tax";
  const keptId = "fed-kept";
  const fedKept = federal.gross - federal.totalTax;

  if (federal.totalTax > 0) {
    addNode({
      id: fedTaxId,
      label: `Federal tax · ${fmt(federal.totalTax)}`,
      tooltip: nodeTooltip(NAME.fedTax, federal.totalTax,
        `total federal income tax owed (effective rate ${pctOf(federal.totalTax, federal.gross)} of gross)`),
      value: federal.totalTax,
      color: COLORS.tax,
      column: 4,
    });
  }
  addNode({
    id: keptId,
    label: `After federal · ${fmt(fedKept)}`,
    tooltip: nodeTooltip(NAME.afterFed, fedKept,
      "what remains of gross income after federal income tax"),
    value: Math.max(0, fedKept),
    color: COLORS.kept,
    column: 4,
  });

  // Bracket → tax / kept
  const addBracketOutcomeLinks = (perBracket, prefix) => {
    perBracket.forEach((b, i) => {
      if (b.taxedAmount <= 0) return;
      const node = nodes.find((n) => n.id === `${prefix}${i}`);
      if (!node) return;
      const bracketName = node._bracketName;
      if (b.taxOnBracket > 0) {
        links.push({
          source: `${prefix}${i}`, target: fedTaxId,
          value: b.taxOnBracket, color: COLORS.tax,
          tooltip: linkTooltip(b.taxOnBracket, bracketName, b.taxedAmount,
            "is paid as", `${NAME.fedTax} (${rateLabel(b.rate)} rate)`),
        });
      }
      const keptHere = b.taxedAmount - b.taxOnBracket;
      if (keptHere > 0) {
        links.push({
          source: `${prefix}${i}`, target: keptId,
          value: keptHere, color: COLORS.kept,
          tooltip: linkTooltip(keptHere, bracketName, b.taxedAmount,
            "is kept (untaxed share of the", `${rateLabel(b.rate)} bracket)`),
        });
      }
    });
  };
  addBracketOutcomeLinks(federal.ordResult.perBracket, "fed-ord-");
  addBracketOutcomeLinks(federal.cgResult.perBracket, "fed-cg-");

  if (fedDeduction > 0) {
    links.push({
      source: "fed-deduction", target: keptId,
      value: fedDeduction, color: COLORS.kept,
      tooltip: linkTooltip(fedDeduction, NAME.fedDed, fedDeduction,
        "passes through untaxed to", NAME.afterFed),
    });
  }

  return { nodes, links, columns: byCol };
}

// ============================================================================
// FICA (PAYROLL TAX) GRAPH
// ============================================================================
export function buildFicaGraph(fica) {
  if (fica.wages <= 0) return null;

  const nodes = [];
  const links = [];
  const byCol = [[], [], []];

  const addNode = (node) => {
    nodes.push(node);
    byCol[node.column].push(node.id);
    return node.id;
  };

  const NAME = {
    wages: "Wages",
    ss: "Social Security base",
    aboveCap: "Wages above SS cap",
    medicare: "Medicare base",
    addMed: "Additional Medicare base",
    ficaTax: "FICA tax",
    afterFica: "After FICA",
  };

  const cap = fica.ssWageBase;
  const ssWages = Math.min(fica.wages, cap);
  const aboveCap = Math.max(0, fica.wages - cap);
  const ficaKept = fica.wages - fica.totalTax;

  // --- Column 0: wages ---
  const wagesId = addNode({
    id: "fica-wages",
    label: `Wages · ${fmt(fica.wages)}`,
    tooltip: nodeTooltip(NAME.wages, fica.wages,
      "ordinary wage income subject to FICA payroll taxes (excludes capital gains)"),
    value: fica.wages,
    color: COLORS.wages,
    column: 0,
  });

  // --- Column 1: FICA components ---
  if (ssWages > 0) {
    addNode({
      id: "fica-ss",
      label: `Soc. Security 6.2% · ${fmt(ssWages)}`,
      tooltip: nodeTooltip(NAME.ss, ssWages,
        `wages subject to the 6.2% Social Security tax (capped at ${fmt(cap)})`),
      value: ssWages,
      color: shade(COLORS.wages, 0),
      column: 1,
    });
    links.push({
      source: wagesId, target: "fica-ss",
      value: ssWages, color: COLORS.wages,
      tooltip: linkTooltip(ssWages, NAME.wages, fica.wages,
        "is subject to the 6.2%", "Social Security tax"),
    });
  }
  if (aboveCap > 0) {
    addNode({
      id: "fica-above-cap",
      label: `Wages above SS cap · ${fmt(aboveCap)}`,
      tooltip: nodeTooltip(NAME.aboveCap, aboveCap,
        `wages exceeding the ${fmt(cap)} Social Security cap — exempt from SS tax (still subject to Medicare)`),
      value: aboveCap,
      color: COLORS.deduction,
      column: 1,
    });
    links.push({
      source: wagesId, target: "fica-above-cap",
      value: aboveCap, color: COLORS.deduction,
      tooltip: linkTooltip(aboveCap, NAME.wages, fica.wages,
        "exceeds the SS wage cap and is", NAME.aboveCap),
    });
  }
  addNode({
    id: "fica-med",
    label: `Medicare 1.45% · ${fmt(fica.wages)}`,
    tooltip: nodeTooltip(NAME.medicare, fica.wages,
      "all wages are subject to the 1.45% Medicare tax (no cap)"),
    value: fica.wages,
    color: shade(COLORS.wages, 0.5),
    column: 1,
  });
  links.push({
    source: wagesId, target: "fica-med",
    value: fica.wages, color: COLORS.wages,
    tooltip: linkTooltip(fica.wages, NAME.wages, fica.wages,
      "is subject to the 1.45%", "Medicare tax (no cap)"),
  });
  if (fica.additionalMedicare > 0) {
    const addBase = fica.additionalMedicare / 0.009;
    addNode({
      id: "fica-add",
      label: `Add'l Medicare 0.9% · ${fmt(addBase)}`,
      tooltip: nodeTooltip(NAME.addMed, addBase,
        "wages over the filing-status threshold ($200k single / $250k MFJ) are subject to an extra 0.9% Medicare tax"),
      value: addBase,
      color: shade(COLORS.wages, 1),
      column: 1,
    });
    links.push({
      source: wagesId, target: "fica-add",
      value: addBase, color: COLORS.wages,
      tooltip: linkTooltip(addBase, NAME.wages, fica.wages,
        "exceeds the high-earner threshold and is subject to the", "Additional 0.9% Medicare tax"),
    });
  }

  // --- Column 2: outcomes ---
  const ficaTaxId = "fica-tax";
  const keptId = "fica-kept";

  if (fica.totalTax > 0) {
    addNode({
      id: ficaTaxId,
      label: `FICA · ${fmt(fica.totalTax)}`,
      tooltip: nodeTooltip(NAME.ficaTax, fica.totalTax,
        `total FICA payroll tax (effective rate ${pctOf(fica.totalTax, fica.wages)} of wages)`),
      value: fica.totalTax,
      color: COLORS.fica,
      column: 2,
    });
  }
  addNode({
    id: keptId,
    label: `After FICA · ${fmt(ficaKept)}`,
    tooltip: nodeTooltip(NAME.afterFica, ficaKept,
      "what remains of wages after FICA payroll taxes"),
    value: Math.max(0, ficaKept),
    color: COLORS.kept,
    column: 2,
  });

  // SS → tax / kept
  if (ssWages > 0) {
    const ssTax = fica.socialSecurity;
    links.push({
      source: "fica-ss", target: ficaTaxId,
      value: ssTax, color: COLORS.fica,
      tooltip: linkTooltip(ssTax, NAME.ss, ssWages,
        "is paid as Social Security tax", "(6.2% rate)"),
    });
    const ssKept = ssWages - ssTax;
    if (ssKept > 0) {
      links.push({
        source: "fica-ss", target: keptId,
        value: ssKept, color: COLORS.kept,
        tooltip: linkTooltip(ssKept, NAME.ss, ssWages,
          "is kept after the 6.2% Social Security tax on this", "wage portion"),
      });
    }
  }
  if (aboveCap > 0) {
    links.push({
      source: "fica-above-cap", target: keptId,
      value: aboveCap, color: COLORS.kept,
      tooltip: linkTooltip(aboveCap, NAME.aboveCap, aboveCap,
        "is exempt from Social Security tax and flows to", NAME.afterFica),
    });
  }
  links.push({
    source: "fica-med", target: ficaTaxId,
    value: fica.medicare, color: COLORS.fica,
    tooltip: linkTooltip(fica.medicare, NAME.medicare, fica.wages,
      "is paid as Medicare tax", "(1.45% rate)"),
  });
  const medKept = fica.wages - fica.medicare;
  if (medKept > 0) {
    links.push({
      source: "fica-med", target: keptId,
      value: medKept, color: COLORS.kept,
      tooltip: linkTooltip(medKept, NAME.medicare, fica.wages,
        "is kept after the 1.45% Medicare tax on", "all wages"),
    });
  }
  if (fica.additionalMedicare > 0) {
    const addBase = fica.additionalMedicare / 0.009;
    const addTax = fica.additionalMedicare;
    links.push({
      source: "fica-add", target: ficaTaxId,
      value: addTax, color: COLORS.fica,
      tooltip: linkTooltip(addTax, NAME.addMed, addBase,
        "is paid as Additional Medicare tax", "(0.9% rate)"),
    });
    const addKept = addBase - addTax;
    if (addKept > 0) {
      links.push({
        source: "fica-add", target: keptId,
        value: addKept, color: COLORS.kept,
        tooltip: linkTooltip(addKept, NAME.addMed, addBase,
          "is kept after the 0.9%", "Additional Medicare tax"),
      });
    }
  }

  return { nodes, links, columns: byCol };
}

// ============================================================================
// STATE GRAPH (income tax + sales tax)
// ============================================================================
//
// Columns:
//   0. GROSS       — Gross income
//   1. SPLIT       — State taxable · State std. deduction · (or passthrough)
//   2. BRACKETS    — State brackets (or one flat-rate node)
//   3. POST-INCOME — State income tax · After state income
//   4. SPENDING    — Taxable spending bucket
//   5. OUTCOMES    — Sales tax · Final after-tax (kept)
//
export function buildStateGraph(stateRes, sales, gross) {
  if (gross <= 0) return null;

  const nodes = [];
  const links = [];
  const byCol = [[], [], [], [], [], []];

  const addNode = (node) => {
    nodes.push(node);
    byCol[node.column].push(node.id);
    return node.id;
  };

  const NAME = {
    gross: "Gross Income",
    stateName: stateRes.stateName || stateRes.state,
    stateTaxable: `${stateRes.state} Taxable Income`,
    stateDed: `${stateRes.state} Standard Deduction`,
    passthrough: "Untaxed (no state income tax)",
    stateTax: `${stateRes.state} Income Tax`,
    afterStateIncome: "After State Income Tax",
    spending: "Taxable Spending",
    salesTax: "Sales Tax",
    finalKept: "Final After-Tax Income",
  };

  // --- Column 0: gross ---
  const grossId = addNode({
    id: "s-gross",
    label: `Gross income · ${fmt(gross)}`,
    tooltip: nodeTooltip(NAME.gross, gross,
      "total income before any state taxes"),
    value: gross,
    color: COLORS.text,
    column: 0,
  });

  // --- Column 1: state taxable + deduction (or passthrough) ---
  let taxableId;
  let stateDed = 0;
  if (stateRes.type !== "none") {
    stateDed = gross - stateRes.stateTaxable;
    taxableId = addNode({
      id: "s-taxable",
      label: `${stateRes.state} taxable · ${fmt(stateRes.stateTaxable)}`,
      tooltip: nodeTooltip(NAME.stateTaxable, stateRes.stateTaxable,
        `income subject to ${NAME.stateName} state income tax`),
      value: stateRes.stateTaxable,
      color: COLORS.wages,
      column: 1,
    });
    if (stateRes.stateTaxable > 0) {
      links.push({
        source: grossId, target: taxableId,
        value: stateRes.stateTaxable, color: COLORS.wages,
        tooltip: linkTooltip(stateRes.stateTaxable, NAME.gross, gross,
          "is", NAME.stateTaxable),
      });
    }
    if (stateDed > 0) {
      addNode({
        id: "s-deduction",
        label: `State std. ded. · ${fmt(stateDed)}`,
        tooltip: nodeTooltip(NAME.stateDed, stateDed,
          `exempt from ${NAME.stateName} state income tax`),
        value: stateDed,
        color: COLORS.deduction,
        column: 1,
      });
      links.push({
        source: grossId, target: "s-deduction",
        value: stateDed, color: COLORS.deduction,
        tooltip: linkTooltip(stateDed, NAME.gross, gross,
          "is shielded by the", NAME.stateDed),
      });
    }
  } else {
    taxableId = addNode({
      id: "s-passthrough",
      label: `No state income tax`,
      tooltip: nodeTooltip(NAME.passthrough, gross,
        `${NAME.stateName} has no state income tax — gross flows through unchanged`),
      value: gross,
      color: COLORS.kept,
      column: 1,
    });
    links.push({
      source: grossId, target: taxableId,
      value: gross, color: COLORS.kept,
      tooltip: linkTooltip(gross, NAME.gross, gross,
        "passes through untaxed —", `${NAME.stateName} has no state income tax`),
    });
  }

  // --- Column 2: brackets ---
  if (stateRes.type === "progressive") {
    stateRes.perBracket.forEach((b, i) => {
      if (b.taxedAmount <= 0) return;
      const id = `s-${i}`;
      const bracketName = `${stateRes.state} ${rateLabel(b.rate)} bracket`;
      addNode({
        id,
        label: `${stateRes.state} ${rateLabel(b.rate)} · ${fmt(b.taxedAmount)}`,
        tooltip: nodeTooltip(bracketName, b.taxedAmount,
          `state taxable income falling into the ${rateLabel(b.rate)} bracket`),
        value: b.taxedAmount,
        color: shade(COLORS.wages, i / Math.max(1, stateRes.perBracket.length - 1)),
        column: 2,
        _bracketName: bracketName,
        _bracketRate: b.rate,
      });
      links.push({
        source: taxableId, target: id,
        value: b.taxedAmount, color: COLORS.wages,
        tooltip: linkTooltip(b.taxedAmount, NAME.stateTaxable, stateRes.stateTaxable,
          "falls into the", bracketName),
      });
    });
  } else if (stateRes.type === "flat" && stateRes.stateTaxable > 0) {
    const id = "s-flat";
    const bracketName = `${stateRes.state} flat ${rateLabel(stateRes.flatRate)} rate`;
    addNode({
      id,
      label: `${stateRes.state} ${rateLabel(stateRes.flatRate)} · ${fmt(stateRes.stateTaxable)}`,
      tooltip: nodeTooltip(bracketName, stateRes.stateTaxable,
        `${NAME.stateName} taxes all state-taxable income at a flat ${rateLabel(stateRes.flatRate)}`),
      value: stateRes.stateTaxable,
      color: COLORS.state,
      column: 2,
      _bracketName: bracketName,
      _bracketRate: stateRes.flatRate,
    });
    links.push({
      source: taxableId, target: id,
      value: stateRes.stateTaxable, color: COLORS.state,
      tooltip: linkTooltip(stateRes.stateTaxable, NAME.stateTaxable, stateRes.stateTaxable,
        "is taxed at the", bracketName),
    });
  }

  // --- Column 3: state income tax + after-state ---
  const taxId = "s-tax";
  const afterStateId = "s-after-income";
  const afterStateAmount = gross - stateRes.totalTax;

  if (stateRes.totalTax > 0) {
    addNode({
      id: taxId,
      label: `State income tax · ${fmt(stateRes.totalTax)}`,
      tooltip: nodeTooltip(NAME.stateTax, stateRes.totalTax,
        `total ${NAME.stateName} state income tax owed (${pctOf(stateRes.totalTax, gross)} of gross)`),
      value: stateRes.totalTax,
      color: COLORS.tax,
      column: 3,
    });
  }
  addNode({
    id: afterStateId,
    label: `After state income · ${fmt(afterStateAmount)}`,
    tooltip: nodeTooltip(NAME.afterStateIncome, afterStateAmount,
      "what remains of gross income after state income tax — this is what you spend or save"),
    value: Math.max(0, afterStateAmount),
    color: COLORS.kept,
    column: 3,
  });

  // Brackets → tax / after-state
  const addStateBracketOutcomeLinks = (bracket, sourceId, sourceName, sourceValue, rate) => {
    if (bracket.taxOnBracket > 0) {
      links.push({
        source: sourceId, target: taxId,
        value: bracket.taxOnBracket, color: COLORS.tax,
        tooltip: linkTooltip(bracket.taxOnBracket, sourceName, sourceValue,
          "is paid as", `${NAME.stateTax} (${rateLabel(rate)} rate)`),
      });
    }
    const keptHere = bracket.taxedAmount - bracket.taxOnBracket;
    if (keptHere > 0) {
      links.push({
        source: sourceId, target: afterStateId,
        value: keptHere, color: COLORS.kept,
        tooltip: linkTooltip(keptHere, sourceName, sourceValue,
          "is kept after the", `${rateLabel(rate)} state tax`),
      });
    }
  };

  if (stateRes.type === "progressive") {
    stateRes.perBracket.forEach((b, i) => {
      if (b.taxedAmount <= 0) return;
      addStateBracketOutcomeLinks(
        b, `s-${i}`,
        `${stateRes.state} ${rateLabel(b.rate)} bracket`,
        b.taxedAmount, b.rate
      );
    });
  } else if (stateRes.type === "flat" && stateRes.stateTaxable > 0) {
    addStateBracketOutcomeLinks(
      { taxedAmount: stateRes.stateTaxable, taxOnBracket: stateRes.totalTax },
      "s-flat",
      `${stateRes.state} flat-rate income`,
      stateRes.stateTaxable, stateRes.flatRate
    );
  } else if (stateRes.type === "none") {
    links.push({
      source: "s-passthrough", target: afterStateId,
      value: gross, color: COLORS.kept,
      tooltip: linkTooltip(gross, NAME.passthrough, gross,
        "flows untaxed to", NAME.afterStateIncome),
    });
  }
  if (stateDed > 0) {
    links.push({
      source: "s-deduction", target: afterStateId,
      value: stateDed, color: COLORS.kept,
      tooltip: linkTooltip(stateDed, NAME.stateDed, stateDed,
        "passes untaxed to", NAME.afterStateIncome),
    });
  }

  // --- Columns 4 & 5: spending → sales tax + final kept ---
  const taxableSpending = Math.min(
    Math.max(0, sales.taxableSpending),
    Math.max(0, afterStateAmount)
  );
  const salesTax = taxableSpending * sales.rate;
  const goodsValue = taxableSpending - salesTax;
  const finalKept = afterStateAmount - salesTax;
  const untaxedRemainder = afterStateAmount - taxableSpending;

  const finalKeptId = "s-final-kept";
  addNode({
    id: finalKeptId,
    label: `Final after-tax · ${fmt(Math.max(0, finalKept))}`,
    tooltip: nodeTooltip(NAME.finalKept, finalKept,
      "income left after every tax modeled here (income, payroll, sales)"),
    value: Math.max(0, finalKept),
    color: COLORS.kept,
    column: 5,
  });

  if (taxableSpending > 0) {
    addNode({
      id: "s-spending",
      label: `Taxable spending · ${fmt(taxableSpending)}`,
      tooltip: nodeTooltip(NAME.spending, taxableSpending,
        `dollars spent on sales-taxable purchases (taxed at ${rateLabel(sales.rate)} in ${NAME.stateName})`),
      value: taxableSpending,
      color: COLORS.spending,
      column: 4,
    });
    addNode({
      id: "s-sales-tax",
      label: `Sales tax ${rateLabel(sales.rate)} · ${fmt(salesTax)}`,
      tooltip: nodeTooltip(NAME.salesTax, salesTax,
        `sales tax paid on taxable spending (${rateLabel(sales.rate)} combined state+local rate)`),
      value: salesTax,
      color: COLORS.sales,
      column: 5,
    });

    if (untaxedRemainder > 0) {
      links.push({
        source: afterStateId, target: finalKeptId,
        value: untaxedRemainder, color: COLORS.kept,
        tooltip: linkTooltip(untaxedRemainder, NAME.afterStateIncome, afterStateAmount,
          "is saved or spent on non-taxable items, flowing to", NAME.finalKept),
      });
    }
    
    if (goodsValue > 0) {
      links.push({
        source: "s-spending", target: finalKeptId,
        value: goodsValue, color: COLORS.kept,
        tooltip: linkTooltip(goodsValue, NAME.spending, taxableSpending,
          "buys actual goods/services and counts toward", NAME.finalKept),
      });
    }
    if (salesTax > 0) {
      links.push({
        source: "s-spending", target: "s-sales-tax",
        value: salesTax, color: COLORS.sales,
        tooltip: linkTooltip(salesTax, NAME.spending, taxableSpending,
          "is paid as", `${NAME.salesTax} (${rateLabel(sales.rate)} rate)`),
      });
    }
    links.push({
      source: afterStateId, target: "s-spending",
      value: taxableSpending, color: COLORS.spending,
      tooltip: linkTooltip(taxableSpending, NAME.afterStateIncome, afterStateAmount,
        "goes to", NAME.spending),
    });
  } else if (afterStateAmount > 0) {
    // No spending — entire after-state-income flows straight to final-kept
    links.push({
      source: afterStateId, target: finalKeptId,
      value: afterStateAmount, color: COLORS.kept,
      tooltip: linkTooltip(afterStateAmount, NAME.afterStateIncome, afterStateAmount,
        "is fully kept (no taxable spending) and flows to", NAME.finalKept),
    });
  }
  

  return { nodes, links, columns: byCol };
}

// ============================================================================
// COLOR HELPER
// ============================================================================
/**
 * Lighten a hex color toward white based on `t` in [0,1]. Used to give
 * each bracket a slightly different shade of its category color.
 */
function shade(hex, t) {
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const r0 = parseInt(m[1].slice(0, 2), 16);
  const g0 = parseInt(m[1].slice(2, 4), 16);
  const b0 = parseInt(m[1].slice(4, 6), 16);
  const k = 0.55 * (1 - t);
  const mix = (c) => clamp(Math.round(c + (255 - c) * k));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r0))}${toHex(mix(g0))}${toHex(mix(b0))}`;
}