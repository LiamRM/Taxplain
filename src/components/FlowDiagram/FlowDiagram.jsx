import React, { useMemo, useState } from "react";
import { COLORS, MONO_STACK } from "../../theme.js";
import { layoutFlow, linkPath } from "./flowLayout.js";

const PAD_X = 24;
const PAD_Y = 24;

/**
 * Generic Sankey-style flow diagram. Receives an already-built graph
 * `{ nodes, links, columns }` and renders it into an SVG. Hover state
 * (which node or link the mouse is over) is lifted up via the
 * `onHoverChange` callback so the parent can display a tooltip bar at
 * the top of the page.
 *
 * Props:
 *   graph    - { nodes, links, columns } from a graph builder, or null
 *   width    - rendered SVG width in pixels
 *   title    - heading text shown above the diagram
 *   subtitle - small description below the heading
 *   legend   - optional array of { color, label } for the top-right key
 *   onHoverChange - (item | null) => void, called when hover changes.
 *                   `item` is `{ kind: "node" | "link", tooltip: string }`.
 */
export default function FlowDiagram({
  graph,
  width,
  title,
  subtitle,
  legend,
  onHoverChange,
}) {
  // Internal hover index (used to dim non-hovered links). Lifted text is
  // sent via onHoverChange.
  const [hoverLinkIdx, setHoverLinkIdx] = useState(null);
  const [hoverNodeId, setHoverNodeId] = useState(null);

  const height = Math.max(360, Math.min(560, width * 0.5));

  const layout = useMemo(() => {
    if (!graph) return null;
    return layoutFlow(graph, width, height, PAD_X, PAD_Y);
  }, [graph, width, height]);

  // Helpers that emit hover events upward AND track local state for dimming.
  const handleLinkEnter = (i, link) => {
    setHoverLinkIdx(i);
    setHoverNodeId(null);
    onHoverChange?.({ kind: "link", tooltip: link.tooltip });
  };
  const handleNodeEnter = (node) => {
    setHoverNodeId(node.id);
    setHoverLinkIdx(null);
    onHoverChange?.({ kind: "node", tooltip: node.tooltip });
  };
  const handleLeave = () => {
    setHoverLinkIdx(null);
    setHoverNodeId(null);
    onHoverChange?.(null);
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "16px 18px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              margin: 0,
              color: COLORS.text,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: 12.5, color: COLORS.textSubtle, margin: "2px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>

        {legend && <Legend items={legend} />}
      </div>

      {layout ? (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          {layout.links.map((link, i) => {
            const isHovered = hoverLinkIdx === i;
            const opacity =
              hoverLinkIdx === null && hoverNodeId === null
                ? 0.45
                : isHovered
                  ? 0.65
                  : 0.12;
            return (
              <path
                key={i}
                d={linkPath(link)}
                stroke={link.color}
                strokeOpacity={opacity}
                strokeWidth={link.thickness}
                fill="none"
                onMouseEnter={() => handleLinkEnter(i, link)}
                onMouseLeave={handleLeave}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {layout.nodes.map((node) => (
            <FlowNode
              key={node.id}
              node={node}
              columnCount={graph.columns.length}
              isHovered={hoverNodeId === node.id}
              onEnter={() => handleNodeEnter(node)}
              onLeave={handleLeave}
            />
          ))}
        </svg>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function FlowNode({ node, columnCount, isHovered, onEnter, onLeave }) {
  const isRightHalf = node.column >= columnCount - 2;
  const labelX = isRightHalf ? node.x - 6 : node.x + node.width + 6;
  const anchor = isRightHalf ? "end" : "start";

  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={node.x - 1}
        y={node.y - 1}
        width={node.width + 2}
        height={node.height + 2}
        fill={node.color}
        rx={2}
        opacity={isHovered ? 1 : 0.95}
        stroke={isHovered ? COLORS.text : "none"}
        strokeWidth={isHovered ? 1.5 : 0}
      />
      <text
        x={labelX}
        y={node.y + node.height / 2}
        fontSize={11}
        fontFamily={MONO_STACK}
        fill={COLORS.text}
        dominantBaseline="middle"
        textAnchor={anchor}
        style={{ pointerEvents: "none" }}
      >
        {node.label}
      </text>
    </g>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            color: COLORS.textSubtle,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              background: it.color,
              borderRadius: 2,
              display: "inline-block",
            }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "24px 16px",
        background: COLORS.bgSubtle,
        border: `1px dashed ${COLORS.border}`,
        borderRadius: 6,
        textAlign: "center",
        fontSize: 13,
        color: COLORS.textSubtle,
      }}
    >
      No data to display.
    </div>
  );
}