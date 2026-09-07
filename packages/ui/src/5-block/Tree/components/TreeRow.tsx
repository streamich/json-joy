import {drule} from 'nano-theme';
import * as React from 'react';
import {Check} from '../../../1-inline/Check';
import {DirIcon} from '../../../1-inline/DirIcon';
import {Dot} from '../../../1-inline/Dot';
import {FileIcon} from '../../../1-inline/FileIcon';
import {SpinnerCircle} from '../../../2-inline-block/SpinnerCircle';
import Arrow from '../../../icons/interactive/Arrow';
import {useStyles} from '../../../styles/context';
import {rowDomId, TREE} from '../constants';
import {useTree} from '../context';
import {normalizeConnector, type Row} from '../flatten';
import {
  actionsClass,
  chainSegClass,
  chainSepClass,
  chevronClass,
  decorationBadgeClass,
  iconCellClass,
  nameCellClass,
  rightCellClass,
  rowClass,
} from '../styles';
import type {TreeNode, TreeRowFlags} from '../types';
import {TreeGuides} from './TreeGuides';

const BASE_PAD = 6;
const RIGHT_PAD = 2;

const rowBgBuilder = drule({});

const defaultIcon = (node: TreeNode, expandable: boolean, expanded: boolean): React.ReactNode => {
  if (node.icon) return node.icon({width: TREE.IconSize, height: TREE.IconSize});
  if (node.kind === 'dir' || (expandable && node.kind !== 'file')) {
    return <DirIcon size={TREE.IconSize} open={expanded} color={node.color} />;
  }
  const label = node.ext || node.name.slice(node.name.lastIndexOf('.') + 1) || node.name;
  return <FileIcon label={label} ext={node.ext} size={TREE.IconSize} color={node.color} />;
};

export interface TreeRowProps {
  row: Row;
  /** Rendered as a pinned sticky-ancestor. */
  sticky?: boolean;
}

/**
 * One styled tree row. Reads all view-state and config from the {@link useTree}
 * context; takes only the row (genuinely instance-local data) as a prop. Composes
 * existing primitives — chevron, `Check`, `DirIcon`/`FileIcon`, `Dot`, action
 * buttons — and a custom highlight for selected / focused / flash backgrounds.
 */
const TreeRowImpl: React.FC<TreeRowProps> = ({row, sticky}) => {
  const state = useTree();
  const styles = useStyles();
  const selectedSet = state.selected.use();
  const focusedId = state.focused.use();
  const flashId = state.highlighted.use();
  const loadingSet = state.loading.use();
  const rowHeight = state.rowHeight$.use();
  const indent = state.indent$.use();
  const lines = state.lines$.use();
  const linesSwitcher = state.linesSwitcher$.use();
  const checkboxes = state.checkboxes$.use();
  const slots = state.slots;

  const {node, chain, depth, expanded, expandable, placeholder} = row;
  const isLoading = loadingSet.has(node.id);
  const nameRef = React.useRef<HTMLDivElement>(null);

  const accent = styles.light ? '#2563eb' : '#3b82f6';
  const guideColor = styles.g(0, 0.16);
  const padLeft = BASE_PAD + depth * indent;
  const showLines = lines !== 'none';
  const baseStyle = lines !== 'none' ? (normalizeConnector(lines) ?? {}) : {};

  if (placeholder) {
    return (
      <div className={rowClass} style={{height: rowHeight, paddingLeft: padLeft}}>
        {showLines && (
          <TreeGuides
            row={row}
            indent={indent}
            basePad={BASE_PAD}
            rowHeight={rowHeight}
            baseStyle={baseStyle}
            defaultColor={guideColor}
            hoverOnly={linesSwitcher === 'hover'}
          />
        )}
        {/* Mirror the chevron + icon columns so the message aligns with real rows. */}
        <span className={chevronClass} style={{width: TREE.ChevronSize, height: rowHeight}} />
        <span className={iconCellClass} style={{width: TREE.IconCol, height: rowHeight, marginRight: 6}} />
        <span className={nameCellClass} style={{color: styles.g(0, 0.4), fontStyle: 'italic'}}>
          {node.name}
        </span>
      </div>
    );
  }

  // A compressed chain row is "active" when any of its folder segments is.
  const isSelected = chain ? chain.some((n) => selectedSet.has(n.id)) : selectedSet.has(node.id);
  const isFocused = chain ? chain.some((n) => focusedId === n.id) : focusedId === node.id;
  const isFlash = chain ? chain.some((n) => flashId === n.id) : flashId === node.id;
  const disabled = state.isDisabled(node);
  const flags: TreeRowFlags = {selected: isSelected, focused: isFocused, flash: isFlash, disabled};

  const tint = node.decorations?.find((d) => d.tint)?.tint;
  // const selBg = styles.light ? 'rgba(37,99,235,0.12)' : 'rgba(59,130,246,0.22)';
  const selBg = 'var(--colBgActive)';
  const flashBg = styles.light ? 'rgba(245,200,66,0.5)' : 'rgba(245,200,66,0.32)';
  const hoverBg = styles.g(0, 0.06);
  const custom = slots.renderRowBackground?.(row, flags);
  const bg = custom ?? (isFlash ? flashBg : isSelected ? selBg : undefined);
  // Keyboard-focus ring, shown only on a focused row that has no background of its
  // own (the arrow-key cursor) — selected rows are indicated by the background.
  const focusRing = isFocused && !bg;
  const bgClass = rowBgBuilder({
    '&::before': {
      bg: bg ?? 'transparent',
      boxShadow: focusRing ? `inset 0 0 0 1px ${accent}` : undefined,
    },
    '&:hover::before': {bg: bg ?? hoverBg},
  });

  const onChevron = (e: React.MouseEvent) => {
    e.stopPropagation();
    state.toggle(node.id);
  };

  // Compressed `a / b / c` label: each folder segment is individually selectable;
  // the active segment is bold, intermediate (path-context) segments are dimmed.
  const renderChainName = (segments: TreeNode[]): React.ReactNode =>
    segments.map((seg, i) => {
      const segActive = focusedId === seg.id || selectedSet.has(seg.id);
      const isTail = i === segments.length - 1;
      return (
        <React.Fragment key={seg.id}>
          {i > 0 && <span className={chainSepClass}>/</span>}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: segment selection mirrors row click; keyboard nav is centralized on the tree container */}
          <span
            className={chainSegClass}
            onClick={(e) => {
              e.stopPropagation();
              state.onRowClick(seg.id, e);
            }}
            style={segActive ? {fontWeight: 600} : isTail ? undefined : {opacity: 0.6}}
          >
            {seg.name}
          </span>
        </React.Fragment>
      );
    });

  const icon = slots.renderIcon ? slots.renderIcon(node, row) : defaultIcon(node, expandable, expanded);
  const name = slots.renderName ? slots.renderName(node, row) : chain ? renderChainName(chain) : node.name;

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: treeitem uses the container's roving aria-activedescendant model; rows are not individually focusable
    // biome-ignore lint/a11y/useKeyWithClickEvents: all keyboard interaction is centralized on the tree container's onKeyDown
    <div
      role="treeitem"
      id={sticky ? undefined : rowDomId(state.treeId, node.id)}
      aria-level={depth + 1}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      aria-posinset={row.posinset}
      aria-setsize={row.setsize}
      className={rowClass + bgClass}
      style={{
        height: rowHeight,
        paddingLeft: padLeft,
        paddingRight: RIGHT_PAD,
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={(e) => state.onRowClick(node.id, e)}
      onDoubleClick={(e) => state.onRowDoubleClick(node.id, e)}
      onContextMenu={(e) => state.onRowContextMenu(node.id, e)}
    >
      {showLines && (
        <TreeGuides
          row={row}
          indent={indent}
          basePad={BASE_PAD}
          rowHeight={rowHeight}
          baseStyle={baseStyle}
          defaultColor={guideColor}
          hoverOnly={linesSwitcher === 'hover'}
        />
      )}

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: chevron is a pointer affordance; expand/collapse is keyboard-driven via the container (Arrow keys) */}
      <span
        className={chevronClass}
        style={{width: TREE.ChevronSize, height: rowHeight}}
        onClick={expandable ? onChevron : undefined}
      >
        {expandable &&
          (isLoading ? (
            <SpinnerCircle size={-1} />
          ) : slots.renderChevron ? (
            slots.renderChevron(row)
          ) : (
            <Arrow
              direction={expanded ? 'd' : 'r'}
              size={TREE.ChevronSize}
              color={styles.g(0, 0.65)}
              // Faint for a lazy node whose children aren't loaded yet.
              style={!expanded && !Array.isArray(node.children) && node.hasChildren ? {opacity: 0.45} : undefined}
            />
          ))}
      </span>

      {checkboxes && (
        <span style={{display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 4}}>
          <Check
            size={16}
            checked={isSelected}
            disabled={disabled}
            onChange={() => state.select(node.id, 'toggle')}
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      )}

      <span
        className={iconCellClass}
        style={{width: TREE.IconCol, height: rowHeight, marginRight: 6, opacity: node.dim ? 0.55 : 1}}
      >
        {icon}
      </span>

      <div
        ref={nameRef}
        className={nameCellClass}
        title={chain ? chain.map((n) => n.name).join('/') : node.name}
        style={{color: tint ?? (node.dim ? styles.g(0, 0.45) : styles.g(0, 0.82))}}
      >
        {name}
      </div>

      <span className={rightCellClass}>
        {node.decorations?.map((d, i) =>
          d.dot ? (
            <Dot key={d.id ?? `dot${i}`} color={d.dot} size={8} />
          ) : d.label !== undefined ? (
            <span
              key={d.id ?? `badge${i}`}
              className={decorationBadgeClass}
              title={d.tooltip}
              style={{background: styles.g(0, 0.08), color: styles.g(0, 0.6)}}
            >
              {d.label}
            </span>
          ) : null,
        )}
        {slots.renderDecorations?.(node, row)}
      </span>

      {slots.renderActions && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: wrapper only stops row-click propagation; the action controls inside are themselves keyboard-accessible
        <span className={actionsClass + ' tree-actions'} onClick={(e) => e.stopPropagation()}>
          {slots.renderActions(node, row)}
        </span>
      )}
    </div>
  );
};

export const TreeRow = React.memo(TreeRowImpl);
