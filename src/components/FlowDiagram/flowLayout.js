// ============================================================================
// FLOW LAYOUT — thin adapter around d3-sankey
//
// Translates between the graph format produced by flowModel.js (id-based
// links, explicit `columns` array) and the format d3-sankey wants
// (index-based links, automatic column inference). Returns a layout in the
// same shape my hand-rolled layout used to produce, so FlowDiagram.jsx
// doesn't need to change.
//
// Why d3-sankey:
//   - Solves the crossings-minimization problem properly via iterative
//     relaxation (the "alpha" cooling loop). My hand-rolled layout just
//     stacked nodes by declaration order, which produced more crossings
//     as the diagrams got denser (especially the state diagram with
//     spending splits).
//   - Provides smooth Bezier link paths via sankeyLinkHorizontal().
//   - Nudges nodes away from each other vertically so labels don't collide.
//
// What I customized:
//   - nodeAlign: forces each node into the column declared by flowModel.js.
//     Without this, d3-sankey would topologically infer columns and might
//     put e.g. a flat-rate state node in column 1 instead of 2, breaking
//     my left-to-right narrative.
//   - nodeSort: preserves the order nodes were added within each column,
//     so deduction stays at the bottom of the gross node (link order from
//     flowModel.js still matters).
// ============================================================================

import { sankey, sankeyLinkHorizontal } from "d3-sankey";

const NODE_WIDTH = 14;
const NODE_PADDING = 12; // vertical gap between nodes in a column

/**
 * @param {{ nodes, links, columns }} graph
 * @param {number} width  - available SVG width
 * @param {number} height - available SVG height
 * @param {number} padX   - left/right padding inside the SVG
 * @param {number} padY   - top/bottom padding inside the SVG
 *
 * @returns {{ nodes: LayoutNode[], links: LayoutLink[] }}
 */
export function layoutFlow(graph, width, height, padX, padY) {
  // d3-sankey mutates its inputs. Deep-copy so we don't corrupt the graph
  // object held in React state by `useMemo`.
  const nodesCopy = graph.nodes.map((n) => ({ ...n }));
  // d3-sankey looks up nodes by the string returned from `nodeId` — so we
  // can pass our links' source/target strings through unchanged. (The
  // alternative is to translate to numeric indices and OMIT nodeId; either
  // works, but keeping ids makes debug logs more readable.)
  const linksCopy = graph.links.map((l) => ({ ...l }));

  // d3-sankey uses node "depth" indices to bucket nodes into columns
  // internally (a sparse array). If our graph leaves a column empty (e.g.
  // no-state-tax case has no bracket nodes in column 2), d3-sankey ends
  // up with `columns[2] === undefined` and crashes when trying to sort it.
  //
  // Fix: build a map from declared column → compact column index that
  // skips empty columns. The visual ordering is preserved, just gap-free.
  const usedColumns = [...new Set(nodesCopy.map((n) => n.column))].sort(
    (a, b) => a - b
  );
  const compactCol = new Map(usedColumns.map((c, i) => [c, i]));
  nodesCopy.forEach((n) => {
    n._compactCol = compactCol.get(n.column);
  });

  // Build the sankey layout. nodeAlign uses our pre-computed `column`
  // field so the visual ordering matches the model's intent.
  const sankeyGen = sankey()
    .nodeWidth(NODE_WIDTH)
    .nodePadding(NODE_PADDING)
    .extent([
      [padX, padY],
      [width - padX, height - padY],
    ])
    .nodeId((n) => n.id)
    .nodeAlign((node) => node._compactCol)
    // Stable sort: keep declaration order so the link-push-order trick
    // (taxable above, deduction below) still controls vertical placement.
    .nodeSort((a, b) => a._declOrder - b._declOrder)
    .linkSort(null);

  // Stamp declaration order so nodeSort has something stable to compare.
  nodesCopy.forEach((n, i) => {
    n._declOrder = i;
  });

  // Run the layout. d3-sankey adds x0,x1,y0,y1 to nodes and y0,y1,width
  // to links; it also rewrites link.source/target to be node references.
  const result = sankeyGen({ nodes: nodesCopy, links: linksCopy });

  // Adapt to the renderer's expected shape. Spread the original node first
  // so any custom fields (tooltip, _bracketName, etc.) propagate through
  // automatically — then override with the layout-computed positions.
  const layoutNodes = result.nodes.map((n) => ({
    ...n,
    id: n.id,
    label: n.label,
    color: n.color,
    column: n.column,
    x: n.x0,
    y: n.y0,
    width: n.x1 - n.x0,
    height: Math.max(2, n.y1 - n.y0),
  }));

  const layoutLinks = result.links.map((l) => ({
    ...l,
    source: l.source.id,
    target: l.target.id,
    value: l.value,
    color: l.color,
    thickness: Math.max(1, l.width),
    // Stash the d3 link object so linkPath() can use sankeyLinkHorizontal
    // without us having to recompute Bezier control points.
    _d3: l,
  }));

  return { nodes: layoutNodes, links: layoutLinks };
}

// Singleton path generator — d3-sankey's helper produces an SVG `d`
// attribute given a link with y0/y1/source/target/width set.
const horizontalLink = sankeyLinkHorizontal();

/**
 * Build the SVG path for a sankey link. Delegates to d3-sankey's helper.
 */
export function linkPath(link) {
  return horizontalLink(link._d3);
}