import type * as React from 'react';
import type {VirtualAlign} from '../../4-card/ScrollArea';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import type {Row} from './flatten';
import type {TreeState} from './state';

export type {Row} from './flatten';

/** Drives the default icon and is otherwise an opaque caller hint. */
export type TreeNodeKind = 'file' | 'dir' | (string & {});

/** Connector line stroke variant — maps onto the `1-inline/Squiggly` component. */
export type TreeConnectorVariant = 'solid' | 'dashed' | 'dotted' | 'squiggly';

/**
 * Full connector style. A bare {@link TreeConnectorVariant} string is shorthand
 * for `{variant}`. Used both tree-wide (the `lines` prop / default) and per node
 * ({@link TreeNode.connector}). Per-node overrides are shallow-merged onto the
 * tree default, so an override may set just `variant` or just `color`.
 */
export interface TreeConnectorStyle {
  variant?: TreeConnectorVariant;
  /** Squiggle peak deviation in px (how "squiggly"), when `variant: 'squiggly'`. */
  amplitude?: number;
  /** Squiggle wavelength in px, when `variant: 'squiggly'`. */
  wavelength?: number;
  /** Line thickness in px. Default 1. */
  thickness?: number;
  /** Line color (any CSS color). Defaults to the themed guide grey. */
  color?: string;
  /** Explicit SVG dash pattern; overrides the variant-derived dashing. */
  dash?: string;
  /**
   * Draw the horizontal elbow stub that points at the row. Default `true`. Set
   * `false` to render only the vertical guide lines (indent guides, no elbows).
   */
  elbow?: boolean;
}

/** A connector spec: a variant shorthand or a full {@link TreeConnectorStyle}. */
export type TreeConnector = TreeConnectorVariant | TreeConnectorStyle;

/** Tree-wide connector setting: `'none'` hides all guides, else the default style. */
export type TreeLines = 'none' | TreeConnector;

/** When the connector lines are shown. Mirrors the "switcher" toggle. */
export type TreeLinesSwitcher = 'on' | 'off' | 'hover';

export type TreeSelectionMode = 'none' | 'single' | 'multi';

/** How a `select()` call combines with the current selection. */
export type TreeSelectMode = 'single' | 'toggle' | 'range';

/** Tree-wide lazy loader for nodes flagged `hasChildren` without eager `children`. */
export type TreeNodeChildrenLoader = (node: TreeNode) => Promise<TreeNode[]>;

/** Right-aligned status decoration (git badge, count, colored dot, ...). */
export interface TreeDecoration {
  id?: string;
  /** A small colored dot before the label (`1-inline/Dot` colors or any CSS color). */
  dot?: string;
  /** Short text/number badge. */
  label?: React.ReactNode;
  /** Tint applied to the row's name (e.g. git modified/added color). */
  tint?: string;
  /** Tooltip shown on hover of the decoration. */
  tooltip?: string;
}

/**
 * A tree node. Extends `MenuItem` (`4-card/StructuralMenu`) so a node IS a menu
 * item: it can feed menus / toolbars / context menus directly (no adapter), and
 * inherits `name`, `icon`, `color`, `dim`, `hasChildren`, `right`, `danger`,
 * `onSelect`, `description`, `keys`, etc.
 *
 * What the tree adds: a `kind` for the default icon, an eager `children` narrowed
 * to tree nodes, a `lazyChildren` loader, `ext` / `connector` / `decorations`, and
 * a caller `data` payload.
 *
 * What the tree does NOT use: view-state lives in {@link TreeState} keyed by id
 * (expanded / selected / focused), and disabled is a tree-level predicate (see
 * `TreeStateOpts.disabled`) rather than the node, so the inherited reactive
 * `MenuItem.active` / `disabled` / `visible` SyncStores are ignored. This keeps a
 * 100k-node tree free of per-node stores and lets the same data render in two
 * trees with independent state.
 */
export interface TreeNode extends MenuItem {
  id: string;
  name: string;
  children?: TreeNode[];
  lazyChildren?: () => Promise<TreeNode[]>;
  /** Drives the default icon: `dir` to a folder, `file` to a file. */
  kind?: TreeNodeKind;
  /** File extension hint for `1-inline/FileIcon`. */
  ext?: string;
  /**
   * Per-node connector override (merged onto the tree-wide `lines` default).
   *
   * - On a directory: styles the vertical guide plus child elbows for all of its
   *   children (every connector segment in the column hanging off this node).
   * - On any node (including a file): styles the horizontal elbow stub pointing
   *   at this row, so a file override only affects that one horizontal segment.
   */
  connector?: TreeConnector;
  /** Right-side decorations (badges / dots / counts). */
  decorations?: TreeDecoration[];
  /** Caller payload, passed back in callbacks. */
  data?: unknown;
}

/** Per-row render-slot overrides; each falls back to a built-in default. */
export interface TreeRenderSlots {
  renderName?: (node: TreeNode, row: Row) => React.ReactNode;
  renderIcon?: (node: TreeNode, row: Row) => React.ReactNode;
  renderChevron?: (row: Row) => React.ReactNode;
  renderActions?: (node: TreeNode, row: Row) => React.ReactNode;
  renderDecorations?: (node: TreeNode, row: Row) => React.ReactNode;
  renderConnector?: (row: Row) => React.ReactNode;
  renderRowBackground?: (row: Row, flags: TreeRowFlags) => string | undefined;
}

export interface TreeRowFlags {
  selected: boolean;
  focused: boolean;
  flash: boolean;
  disabled: boolean;
}

export interface TreeEventHandlers {
  onActivate?: (node: TreeNode, e: React.MouseEvent | React.KeyboardEvent) => void;
  onContextMenu?: (node: TreeNode, e: React.MouseEvent) => void;
  onExpandedChange?: (expanded: ReadonlySet<string>) => void;
  onSelectionChange?: (selected: ReadonlySet<string>) => void;
  onFocusChange?: (id: string | null) => void;
}

/** Options for the headless {@link TreeState} constructor. */
export interface TreeStateOpts extends TreeEventHandlers {
  roots: TreeNode[];
  expanded?: Iterable<string>;
  selected?: Iterable<string>;
  selection?: TreeSelectionMode;
  /** Lazy data source for nodes with `hasChildren` and no eager `children`. */
  loadChildren?: TreeNodeChildrenLoader;
  /**
   * Predicate marking a node non-interactive (dimmed, not selectable/activatable).
   * Kept here, not on the node, so disabled stays centralized like the rest of the
   * view-state and composes with gitignore / permission logic.
   */
  disabled?: (node: TreeNode) => boolean;
  rowHeight?: number;
  indent?: number;
  lines?: TreeLines;
  linesSwitcher?: TreeLinesSwitcher;
  checkboxes?: boolean;
  /**
   * Compress chains of single-child directories into one row (`a / b / c`, the
   * VS Code "compact folders" behavior). Default `false`.
   */
  compressed?: boolean;
  /**
   * Pin the ancestors of the top visible row as stacked rows at the top of the
   * viewport (VS Code "sticky scroll"). `true` enables it with a default depth cap;
   * a number sets the cap (keeping the deepest that-many ancestors). Default off.
   */
  stickyAncestors?: boolean | number;
}

/** Imperative handle exposed via `ref`. */
export interface TreeHandle {
  /** Expand all ancestors of `id`, focus it, and scroll it into view. */
  reveal(id: string): void;
  /** Reveal `id` and briefly flash it. */
  flash(id: string): void;
  expandAll(): void;
  collapseAll(): void;
  scrollToIndex(index: number, align?: VirtualAlign): void;
  focus(id: string): void;
  /** The underlying headless state, for advanced use. */
  state: TreeState;
}

export interface TreeProps extends TreeRenderSlots, TreeEventHandlers {
  /** Tree data: an array of root nodes. */
  roots: TreeNode[];
  /** Bring-your-own headless state; created internally when omitted. */
  state?: TreeState;

  // Expansion — controlled OR uncontrolled.
  expanded?: Iterable<string>;
  defaultExpanded?: Iterable<string>;

  // Selection — controlled OR uncontrolled.
  selected?: Iterable<string>;
  defaultSelected?: Iterable<string>;
  selection?: TreeSelectionMode;

  /** Fixed row height in px (required for the O(1) virtualizer fast path). Default 24. */
  rowHeight?: number;
  /** Indent step per depth level, in px. Default 16. */
  indent?: number;
  /** Viewport height. Default 320. */
  height?: number | string;
  /** Extra rows rendered above/below the window. Default 12. */
  overscan?: number;

  lines?: TreeLines;
  linesSwitcher?: TreeLinesSwitcher;
  checkboxes?: boolean;
  /** Compress single-child directory chains into one `a / b / c` row. Default `false`. */
  compressed?: boolean;
  /**
   * Pin the top row's ancestors as stacked rows at the top (VS Code "sticky
   * scroll"). `true` enables with a default cap; a number sets the cap. Default off.
   */
  stickyAncestors?: boolean | number;

  loadChildren?: TreeNodeChildrenLoader;
  /** Predicate marking a node non-interactive (dimmed, not selectable). */
  disabled?: (node: TreeNode) => boolean;

  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}
