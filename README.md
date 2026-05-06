# Tax Flow Explorer

Interactive Sankey-style flow diagram for 2025 US federal and state income
taxes. Visualizes how every dollar of gross income flows through deductions,
federal brackets, state brackets, and ends up as either tax paid or
take-home.

## Features

- **Flow diagram** — single visualization showing gross → deductions → federal/state brackets → tax/kept.
- **Filing status dropdown** — Single, Married Filing Jointly, Head of Household.
- **State dropdown** — all 50 states + DC, with progressive brackets for the top 10 populous states and a flat-rate approximation for the rest.
- **Adjustable income mix** — drag a slider, or type ordinary/capital gains dollars directly.
- **Live summary cards** — federal tax, state tax, combined effective rate, take-home.

## Project structure

```
src/
  App.jsx                       # top-level component, owns canonical state
  main.jsx                      # ReactDOM entry
  theme.js                      # color & font tokens

  data/                         # static lookup tables
    federalBrackets.js          # 2025 federal brackets + std. deductions
    stateBrackets.js            # state tax data (progressive or flat)

  lib/                          # pure functions, no React
    federalTax.js               # computeFederalTax + bracket helpers
    stateTax.js                 # computeStateTax (progressive/flat/none)
    format.js                   # money/percentage formatters

  hooks/                        # React hooks
    useTaxCalculation.js        # memoized federal+state calculation
    useContainerWidth.js        # ResizeObserver-based width tracker

  components/
    Layout/
      Header.jsx                # title + selected-income badge
      HeroCard.jsx              # small metric card
    Inputs/
      InputsPanel.jsx           # filing/state/mix/dollar inputs
      LabeledSelect.jsx         # generic dropdown
      DollarField.jsx           # $ input that doesn't fight the user
      MixSlider.jsx             # ordinary/cap-gains percentage slider
    FlowDiagram/
      FlowDiagram.jsx           # SVG renderer + hover state
      flowModel.js              # builds nodes/links from tax result
      flowLayout.js             # assigns x/y positions, builds Bezier paths

index.html
package.json                    # Vite + React 18
vite.config.js
.github/workflows/deploy.yml    # auto-deploy to GitHub Pages
```

The split is deliberate: pure logic in `lib/` and `data/`, React state in
`hooks/`, presentational components in `components/`. The flow diagram has
its own folder because it splits cleanly into model (build the graph),
layout (place it on screen), and view (render SVG).

## Tax data

- **Federal**: 2025 brackets per IRS Rev. Proc. 2024-40 with One Big Beautiful Bill Act standard deduction adjustments ($15,750 single / $31,500 MFJ / $23,625 HoH).
- **State**: Top 10 populous states (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI) modeled with their actual progressive brackets where applicable, and a flat-rate approximation for the rest. State data is simplified for visualization — single-filer schedules only, no LTCG preferential treatment at the state level (most states tax cap gains as ordinary income).

**Federal-only / state-only** — does not include FICA, NIIT, AMT, credits,
itemized deductions, local taxes, or other planning variables.

## Local development

```bash
npm install
npm run dev      # vite dev server on http://localhost:5173
npm run build    # produces ./dist
npm run preview  # serves the production build locally
```

## Deployment

Push to `main`. The GitHub Actions workflow builds with Vite and publishes
`./dist` to GitHub Pages. In the repo's **Settings → Pages → Build and
deployment**, set Source to **"GitHub Actions"**.

## Tech

- React 18
- Vite 5 (zero-config bundler / dev server)
- Plain SVG for the flow diagram (no charting dependency)
- No state management library — `useState` in `App.jsx` is plenty
