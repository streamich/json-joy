import * as React from 'react';
import {Squiggly} from '../../../1-inline/Squiggly';
import {TREE} from '../constants';
import {normalizeConnector, type Row} from '../flatten';
import {guidesClass} from '../styles';
import type {TreeConnectorStyle} from '../types';

export interface TreeGuidesProps {
  row: Row;
  /** Indent step per depth level, in px. */
  indent: number;
  /** Left padding before the first guide column, in px. */
  basePad: number;
  rowHeight: number;
  /** Tree-wide default connector style (already resolved from `lines`). */
  baseStyle: TreeConnectorStyle;
  /** Fallback line color when a style sets none. */
  defaultColor: string;
  /** Only visible on row hover (linesSwitcher = "hover"). */
  hoverOnly?: boolean;
}

const THICKNESS = 1;
const SQUIGGLE_AMP = 1.1;
const SQUIGGLE_WAVELENGTH = 5;
/** How far short of the chevron column's right edge a leaf-row stub stops, in px. */
const FILE_ELBOW_GAP = 6;
/** Variant to SVG dash pattern (solid / squiggly have none). */
const DASH: Partial<Record<string, string>> = {dashed: '4 3', dotted: '1 3'};

const merge = (base: TreeConnectorStyle, override?: TreeConnectorStyle): TreeConnectorStyle =>
  override ? {...base, ...override} : base;

/**
 * Indent connector guides driven by {@link Row.hasNextSibling} /
 * {@link Row.connectors}. Ancestor columns draw a pass-through vertical when the
 * ancestor continues; the node's own column draws an elbow (vertical top to middle,
 * horizontal stub toward the chevron/icon, and a lower vertical only when the node
 * has a following sibling).
 *
 * Each segment's style is the tree default merged with an override: a column's
 * vertical + elbow verticals inherit the owning **directory's** `connector`
 * (`row.connectors[c]`), while the horizontal stub uses the **row's own**
 * `connector` if set (so a file styles only its own stub), else the directory's.
 * Solid segments render as cheap `<div>`s; dashed / dotted / squiggly render via
 * the `<Squiggly>` SVG.
 */
export const TreeGuides: React.FC<TreeGuidesProps> = ({
  row,
  indent,
  basePad,
  rowHeight,
  baseStyle,
  defaultColor,
  hoverOnly,
}) => {
  if (row.depth === 0) return null;
  const half = indent / 2;
  const mid = rowHeight / 2;
  const segs: React.ReactNode[] = [];

  // Draw a vertical segment from y1 to y2 centered on x, styled per `style`.
  const vseg = (key: string, x: number, y1: number, y2: number, style: TreeConnectorStyle) => {
    const h = y2 - y1;
    if (h <= 0) return;
    const color = style.color ?? defaultColor;
    const thickness = style.thickness ?? THICKNESS;
    const variant = style.variant ?? 'solid';
    const dash = style.dash ?? DASH[variant];
    if (variant === 'squiggly') {
      const amp = style.amplitude ?? SQUIGGLE_AMP;
      const w = amp * 2 + thickness + 1;
      segs.push(
        <Squiggly
          key={key}
          width={w}
          height={h}
          from={[w / 2, 0]}
          to={[w / 2, h]}
          amplitude={amp}
          wavelength={style.wavelength ?? SQUIGGLE_WAVELENGTH}
          color={color}
          thickness={thickness}
          style={{position: 'absolute', left: x + thickness / 2 - w / 2, top: y1}}
        />,
      );
    } else if (dash) {
      const w = thickness + 2;
      segs.push(
        <Squiggly
          key={key}
          straight
          width={w}
          height={h}
          from={[w / 2, 0]}
          to={[w / 2, h]}
          dash={dash}
          color={color}
          thickness={thickness}
          style={{position: 'absolute', left: x + thickness / 2 - w / 2, top: y1}}
        />,
      );
    } else {
      segs.push(
        <div
          key={key}
          style={{position: 'absolute', left: x, top: y1, width: thickness, height: h, background: color}}
        />,
      );
    }
  };

  // Draw a horizontal segment from x1 to x2 at vertical position y, styled per `style`.
  const hseg = (key: string, x1: number, x2: number, y: number, style: TreeConnectorStyle) => {
    const w = x2 - x1;
    if (w <= 0) return;
    const color = style.color ?? defaultColor;
    const thickness = style.thickness ?? THICKNESS;
    const variant = style.variant ?? 'solid';
    const dash = style.dash ?? DASH[variant];
    if (variant === 'squiggly') {
      const amp = style.amplitude ?? SQUIGGLE_AMP;
      const boxH = amp * 2 + thickness + 1;
      segs.push(
        <Squiggly
          key={key}
          width={w}
          height={boxH}
          from={[0, boxH / 2]}
          to={[w, boxH / 2]}
          amplitude={amp}
          wavelength={style.wavelength ?? SQUIGGLE_WAVELENGTH}
          color={color}
          thickness={thickness}
          style={{position: 'absolute', left: x1, top: y + thickness / 2 - boxH / 2}}
        />,
      );
    } else if (dash) {
      const boxH = thickness + 2;
      segs.push(
        <Squiggly
          key={key}
          straight
          width={w}
          height={boxH}
          from={[0, boxH / 2]}
          to={[w, boxH / 2]}
          dash={dash}
          color={color}
          thickness={thickness}
          style={{position: 'absolute', left: x1, top: y + thickness / 2 - boxH / 2}}
        />,
      );
    } else {
      segs.push(
        <div
          key={key}
          style={{position: 'absolute', left: x1, top: y, width: w, height: thickness, background: color}}
        />,
      );
    }
  };

  // Ancestor pass-through columns: column c reflects the directory at depth c.
  for (let c = 0; c < row.depth - 1; c++) {
    if (!row.hasNextSibling[c + 1]) continue;
    vseg(`a${c}`, basePad + c * indent + half, 0, rowHeight, merge(baseStyle, row.connectors[c]));
  }

  // The node's own elbow column.
  const ex = basePad + (row.depth - 1) * indent + half;
  const contentStart = basePad + row.depth * indent;
  // Verticals belong to the owning directory's column; the horizontal points at
  // this row, so it uses the row's own connector override (if any), else the
  // directory's. This is what makes a file's override touch only its own stub.
  const vStyle = merge(baseStyle, row.connectors[row.depth - 1]);
  const hStyle = merge(baseStyle, normalizeConnector(row.node.connector) ?? row.connectors[row.depth - 1]);
  const vThickness = vStyle.thickness ?? THICKNESS;
  vseg('et', ex, 0, mid, vStyle);
  if (!row.last) vseg('eb', ex, mid, rowHeight, vStyle);
  // The horizontal stub (elbow) is opt-out: `elbow: false` renders only the
  // vertical guide lines. Expandable rows stop at the chevron column's left edge;
  // leaf rows (files) have no chevron, so the stub reaches further toward the icon
  // but stops short of the column's right edge (where a checkbox or the icon sits).
  // Start 1px past the vertical so the corner pixel isn't painted twice (which
  // reads as a darker dot).
  if (hStyle.elbow !== false) {
    const hEnd = contentStart + (row.expandable ? 0 : TREE.ChevronSize - FILE_ELBOW_GAP);
    hseg('eh', ex + vThickness, hEnd, mid, hStyle);
  }

  return (
    <div className={guidesClass + (hoverOnly ? ' tree-guides-hover' : '')} style={{right: 0}}>
      {segs}
    </div>
  );
};
