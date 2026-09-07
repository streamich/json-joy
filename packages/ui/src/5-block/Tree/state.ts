import type * as React from 'react';
import {ScrollState, type VirtualAlign, type VirtualWindow} from '../../4-card/ScrollArea';
import type {UiLifeCycles} from '../../types';
import * as rsync from '../../utils/rsync';
import {TREE} from './constants';
import {flatten, isExpandable, type Row} from './flatten';
import type {
  TreeLines,
  TreeLinesSwitcher,
  TreeNode,
  TreeRenderSlots,
  TreeSelectionMode,
  TreeSelectMode,
  TreeStateOpts,
} from './types';

let counter = 0;

const withAdded = (set: ReadonlySet<string>, id: string): Set<string> => {
  const next = new Set(set);
  next.add(id);
  return next;
};

const withDeleted = (set: ReadonlySet<string>, id: string): Set<string> => {
  const next = new Set(set);
  next.delete(id);
  return next;
};

/** Normalize the `stickyAncestors` option (`boolean | number`) to a max-count (0 = off). */
const toStickyMax = (v: boolean | number | undefined): number =>
  v === undefined || v === false ? 0 : v === true ? TREE.StickyMax : Math.max(0, Math.floor(v));

/**
 * Headless core of the file `Tree`. Owns all view-state (expanded / selected /
 * focused), keyed by node id rather than stored on the data nodes, and exposes a
 * memoized {@link rows} computed that flattens the visible nodes into a
 * windowable list. Usable without the row UI (tests, custom renderers).
 */
export class TreeState implements UiLifeCycles {
  /** Unique id used to namespace row DOM ids (`aria-activedescendant`). */
  public readonly treeId = `tree${++counter}`;

  // ------------------------------------ view-state (centralized, keyed by id)
  public readonly roots$: rsync.ReactValue<TreeNode[]>;
  public readonly expanded: rsync.ReactValue<ReadonlySet<string>>;
  public readonly selected: rsync.ReactValue<ReadonlySet<string>>;
  public readonly focused = rsync.val<string | null>(null);
  /** Briefly highlighted row id (jump-to flash). */
  public readonly highlighted = rsync.val<string | null>(null);

  // ----------------------------------------------------------- async children
  public readonly loaded = rsync.val<ReadonlyMap<string, TreeNode[]>>(new Map());
  public readonly loading = rsync.val<ReadonlySet<string>>(new Set());
  public readonly errored = rsync.val<ReadonlySet<string>>(new Set());

  // --------- layout / presentation (reactive so the view + virtualizer react)
  public readonly selection$: rsync.ReactValue<TreeSelectionMode>;
  public readonly rowHeight$: rsync.ReactValue<number>;
  public readonly indent$: rsync.ReactValue<number>;
  public readonly lines$: rsync.ReactValue<TreeLines>;
  public readonly linesSwitcher$: rsync.ReactValue<TreeLinesSwitcher>;
  public readonly checkboxes$: rsync.ReactValue<boolean>;
  public readonly compressed$: rsync.ReactValue<boolean>;
  /** Sticky-ancestor depth cap; 0 disables the pinned overlay. */
  public readonly stickyMax$: rsync.ReactValue<number>;

  /** Flattened visible rows — `comp([roots, expanded, loaded, errored], flatten)`. */
  public readonly rows: rsync.ReactComputed<Row[]>;

  /** Native-scroll host; reused by the ScrollArea virtualizer. */
  public readonly scroll = new ScrollState();

  /** Render-slot overrides, refreshed by `<Tree>` from props. */
  public slots: TreeRenderSlots = {};

  /** Virtual window, registered by `<Tree>` for `reveal` / `scrollToIndex`. */
  public window: VirtualWindow | null = null;

  // id to node and id to parentId indexes, for nav / reveal.
  private byId = new Map<string, TreeNode>();
  private parentOf = new Map<string, string | null>();

  private _anchor: string | null = null;
  private _taBuffer = '';
  private _taTime = 0;
  private _flashTimer: ReturnType<typeof setTimeout> | 0 = 0;

  constructor(public readonly opts: TreeStateOpts) {
    this.roots$ = rsync.val<TreeNode[]>(opts.roots);
    this.expanded = rsync.val<ReadonlySet<string>>(new Set(opts.expanded));
    this.selected = rsync.val<ReadonlySet<string>>(new Set(opts.selected));
    this.selection$ = rsync.val<TreeSelectionMode>(opts.selection ?? 'single');
    this.rowHeight$ = rsync.val<number>(opts.rowHeight ?? TREE.RowHeight);
    this.indent$ = rsync.val<number>(opts.indent ?? TREE.Indent);
    this.lines$ = rsync.val<TreeLines>(opts.lines ?? 'solid');
    this.linesSwitcher$ = rsync.val<TreeLinesSwitcher>(opts.linesSwitcher ?? 'on');
    this.checkboxes$ = rsync.val<boolean>(opts.checkboxes ?? false);
    this.compressed$ = rsync.val<boolean>(opts.compressed ?? false);
    this.stickyMax$ = rsync.val<number>(toStickyMax(opts.stickyAncestors));
    this.rows = rsync.comp<Row[]>([this.roots$, this.expanded, this.loaded, this.errored, this.compressed$], () =>
      flatten(this.roots$.value, this.expanded.value, {
        resolveChildren: this.resolveChildren,
        errored: this.errored.value,
        compressed: this.compressed$.value,
      }),
    );
    this.indexNodes(opts.roots, null);
  }

  public node(id: string): TreeNode | undefined {
    return this.byId.get(id);
  }

  public start(): () => void {
    return () => {
      if (this._flashTimer) clearTimeout(this._flashTimer);
    };
  }

  private resolveChildren = (node: TreeNode): TreeNode[] | undefined => node.children ?? this.loaded.value.get(node.id);

  private indexNodes(nodes: TreeNode[], parentId: string | null): void {
    for (const node of nodes) {
      this.byId.set(node.id, node);
      this.parentOf.set(node.id, parentId);
      const children = node.children ?? this.loaded.value.get(node.id);
      if (children) this.indexNodes(children, node.id);
    }
  }

  /** Whether a node is non-interactive, per the tree-level predicate. */
  public isDisabled(node: TreeNode): boolean {
    return this.opts.disabled?.(node) ?? false;
  }

  public setRoots(roots: TreeNode[]): void {
    this.roots$.next(roots);
    this.byId = new Map();
    this.parentOf = new Map();
    this.indexNodes(roots, null);
  }

  public setSlots(slots: TreeRenderSlots): void {
    this.slots = slots;
  }

  public setLayout(
    layout: Partial<
      Pick<
        TreeStateOpts,
        | 'rowHeight'
        | 'indent'
        | 'lines'
        | 'linesSwitcher'
        | 'checkboxes'
        | 'compressed'
        | 'stickyAncestors'
        | 'selection'
      >
    >,
  ): void {
    if (layout.rowHeight !== undefined) this.rowHeight$.set(layout.rowHeight);
    if (layout.indent !== undefined) this.indent$.set(layout.indent);
    if (layout.lines !== undefined) this.lines$.set(layout.lines);
    if (layout.linesSwitcher !== undefined) this.linesSwitcher$.set(layout.linesSwitcher);
    if (layout.checkboxes !== undefined) this.checkboxes$.set(layout.checkboxes);
    if (layout.compressed !== undefined) this.compressed$.set(layout.compressed);
    if (layout.stickyAncestors !== undefined) this.stickyMax$.set(toStickyMax(layout.stickyAncestors));
    if (layout.selection !== undefined) this.selection$.set(layout.selection);
  }

  public setWindow(window: VirtualWindow | null): void {
    this.window = window;
  }

  public readonly setViewport = (el: HTMLDivElement | null): void => {
    this.scroll.setViewport(el);
  };

  public setExpanded(next: ReadonlySet<string>, fromProps = false): void {
    this.expanded.next(next);
    if (!fromProps) this.opts.onExpandedChange?.(next);
  }

  public readonly toggle = (id: string): void => {
    if (this.expanded.value.has(id)) this.collapse(id);
    else this.expand(id);
  };

  public readonly expand = (id: string): void => {
    const node = this.byId.get(id);
    if (!node) return;
    if (!this.expanded.value.has(id)) this.setExpanded(withAdded(this.expanded.value, id));
    this.ensureLoaded(node);
  };

  public readonly collapse = (id: string): void => {
    if (this.expanded.value.has(id)) this.setExpanded(withDeleted(this.expanded.value, id));
  };

  public readonly expandAll = (): void => {
    const next = new Set(this.expanded.value);
    for (const node of this.byId.values()) if (isExpandable(node)) next.add(node.id);
    this.setExpanded(next);
  };

  public readonly collapseAll = (): void => {
    this.setExpanded(new Set());
  };

  private ensureLoaded(node: TreeNode): void {
    // A node's own `lazyChildren`, else the tree-wide `loadChildren` for a node
    // flagged `hasChildren`. Normalized to a zero-arg loader either way.
    const treeLoader = this.opts.loadChildren;
    const loader: (() => Promise<TreeNode[]>) | undefined =
      node.lazyChildren ?? (node.hasChildren && treeLoader ? () => treeLoader(node) : undefined);
    if (!loader) return;
    if (this.loaded.value.has(node.id) || this.loading.value.has(node.id)) return;
    this.loading.next(withAdded(this.loading.value, node.id));
    if (this.errored.value.has(node.id)) this.errored.next(withDeleted(this.errored.value, node.id));
    Promise.resolve(loader()).then(
      (children) => {
        const map = new Map(this.loaded.value);
        map.set(node.id, children);
        this.loaded.next(map);
        this.loading.next(withDeleted(this.loading.value, node.id));
        this.indexNodes(children, node.id);
      },
      () => {
        this.loading.next(withDeleted(this.loading.value, node.id));
        this.errored.next(withAdded(this.errored.value, node.id));
      },
    );
  }

  public setSelected(next: ReadonlySet<string>, fromProps = false): void {
    this.selected.next(next);
    if (!fromProps) this.opts.onSelectionChange?.(next);
  }

  public readonly select = (id: string, mode: TreeSelectMode = 'single'): void => {
    if (this.selection$.value === 'none') return;
    let next: Set<string>;
    if (this.selection$.value === 'single') next = new Set([id]);
    else if (mode === 'toggle') {
      next = new Set(this.selected.value);
      if (next.has(id)) next.delete(id);
      else next.add(id);
    } else if (mode === 'range' && this._anchor) next = this.rangeSelect(this._anchor, id);
    else next = new Set([id]);
    this.setSelected(next);
    if (mode !== 'range') this._anchor = id;
  };

  private rangeSelect(from: string, to: string): Set<string> {
    const rows = this.rows.value;
    const a = this.indexOf(from);
    const b = this.indexOf(to);
    if (a < 0 || b < 0) return new Set([to]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const next = new Set(this.selected.value);
    for (let i = lo; i <= hi; i++) if (!rows[i].placeholder) next.add(rows[i].node.id);
    return next;
  }

  public readonly focus = (id: string | null): void => {
    this.focused.next(id);
    this.opts.onFocusChange?.(id);
    if (id) {
      const idx = this.indexOf(id);
      if (idx >= 0) this.scrollRowIntoView(idx);
    }
  };

  /**
   * Scroll row `idx` into view. With sticky ancestors on, the content is already
   * pushed down by the overlay height, so revealing a row above the fold is just
   * `scrollTo(rowTop)` — the push lands it directly below its pinned ancestors. A
   * row below the fold is bottom-aligned, compensating for the current push so it
   * isn't shoved off the bottom edge. Without sticky, defer to the virtualizer's
   * `nearest`. Uniform row height (the fast path) lets us place it by arithmetic.
   */
  private scrollRowIntoView(idx: number): void {
    const win = this.window;
    if (!win) return;
    const max = this.stickyMax$.value;
    const rh = this.rowHeight$.value;
    if (max <= 0) {
      win.scrollToIndex(idx, 'nearest');
      return;
    }
    const scroll = this.scroll;
    const top = scroll.scrollTop$.value;
    const client = scroll.clientHeight$.value;
    const off = idx * rh;
    if (off < top) scroll.scrollTo(off);
    else if (off + rh > top + client) scroll.scrollTo(off + rh - client + this.stickyLayout(top, rh, max).height);
  }

  public readonly reveal = (id: string): void => {
    const ancestors: string[] = [];
    let parent = this.parentOf.get(id) ?? null;
    while (parent) {
      ancestors.push(parent);
      parent = this.parentOf.get(parent) ?? null;
    }
    if (ancestors.length) {
      const next = new Set(this.expanded.value);
      for (const ancestorId of ancestors) {
        next.add(ancestorId);
        const ancestor = this.byId.get(ancestorId);
        if (ancestor) this.ensureLoaded(ancestor);
      }
      this.setExpanded(next);
    }
    this.focus(id);
  };

  public readonly flash = (id: string): void => {
    this.reveal(id);
    this.highlighted.next(id);
    if (this._flashTimer) clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => this.highlighted.next(null), TREE.FlashDuration);
  };

  public readonly scrollToIndex = (index: number, align?: VirtualAlign): void => {
    this.window?.scrollToIndex(index, align);
  };

  public readonly activate = (id: string, e: React.MouseEvent | React.KeyboardEvent): void => {
    const node = this.byId.get(id);
    if (!node || this.isDisabled(node)) return;
    this.opts.onActivate?.(node, e);
  };

  public readonly onRowClick = (id: string, e: React.MouseEvent): void => {
    this.focus(id);
    const node = this.byId.get(id);
    if (!node || this.isDisabled(node)) return;
    if (this.selection$.value === 'multi') {
      if (e.shiftKey) this.select(id, 'range');
      else if (e.metaKey || e.ctrlKey) this.select(id, 'toggle');
      else this.select(id, 'single');
    } else this.select(id, 'single');
  };

  public readonly onRowDoubleClick = (id: string, e: React.MouseEvent): void => {
    const node = this.byId.get(id);
    if (!node) return;
    if (isExpandable(node)) this.toggle(id);
    this.activate(id, e);
  };

  public readonly onRowContextMenu = (id: string, e: React.MouseEvent): void => {
    const node = this.byId.get(id);
    if (!node) return;
    this.focus(id);
    this.opts.onContextMenu?.(node, e);
  };

  public readonly onKeyDown = (e: React.KeyboardEvent): void => {
    const rows = this.rows.value;
    if (!rows.length) return;
    const focusedId = this.focused.value;
    const idx = focusedId ? this.indexOf(focusedId) : -1;
    const current = idx >= 0 ? rows[idx] : undefined;
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        this.focusRow(this.move(idx, 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        this.focusRow(this.move(idx, -1));
        break;
      }
      case 'Home': {
        e.preventDefault();
        this.focusRow(this.move(-1, 1));
        break;
      }
      case 'End': {
        e.preventDefault();
        this.focusRow(this.move(rows.length, -1));
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (!current) this.focusRow(this.move(-1, 1));
        else if (current.expandable && !current.expanded) this.expand(current.node.id);
        else if (current.expandable && current.expanded) this.focusRow(this.move(idx, 1));
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (!current) break;
        if (current.expandable && current.expanded) this.collapse(current.node.id);
        else {
          // For a compressed chain the visual parent is the outermost segment's parent.
          const head = current.chain ? current.chain[0] : current.node;
          const parent = this.parentOf.get(head.id);
          if (parent) this.focus(parent);
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (current) {
          this.select(current.node.id, 'single');
          this.activate(current.node.id, e);
        }
        break;
      }
      case ' ': {
        e.preventDefault();
        if (current) {
          const toggle = this.checkboxes$.value || this.selection$.value === 'multi';
          this.select(current.node.id, toggle ? 'toggle' : 'single');
        }
        break;
      }
      case '*': {
        e.preventDefault();
        this.expandSiblings(current);
        break;
      }
      default: {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.typeAhead(e.key, idx);
      }
    }
  };

  private focusRow(row: Row | undefined): void {
    if (row) this.focus(row.node.id);
  }

  /** Next non-placeholder row from `from` stepping by `step` (±1), or undefined. */
  private move(from: number, step: number): Row | undefined {
    const rows = this.rows.value;
    for (let i = from + step; i >= 0 && i < rows.length; i += step) if (!rows[i].placeholder) return rows[i];
    return undefined;
  }

  /**
   * The ancestor rows to pin above the row at `anchorIndex` (sticky scroll),
   * ordered root-most first. Walks back from the anchor collecting the nearest
   * preceding row at each shallower depth, then keeps the deepest `max` (closest to
   * the anchor) so the cap drops the least-relevant outermost levels.
   */
  public stickyAncestors(anchorIndex: number, max: number): Row[] {
    const rows = this.rows.value;
    if (max <= 0 || anchorIndex <= 0 || anchorIndex >= rows.length) return [];
    const chain: Row[] = [];
    let needDepth = rows[anchorIndex].depth - 1;
    for (let i = anchorIndex - 1; i >= 0 && needDepth >= 0; i--) {
      const row = rows[i];
      if (row.placeholder) continue;
      if (row.depth === needDepth) {
        chain.push(row);
        needDepth--;
      }
    }
    chain.reverse(); // collected deepest-first; pin root-first
    return chain.length > max ? chain.slice(chain.length - max) : chain;
  }

  /**
   * Sticky-scroll geometry for the current pixel `scrollTop`: the ancestor rows to
   * pin (root-first) and the overlay's pixel `height`. The height interpolates
   * between the top row's pinned height (`depth` levels) and the next row's, so the
   * deepest line **slides in/out continuously** as you cross a folder boundary
   * instead of popping. The view pushes its content down by this same `height`, so
   * a newly-pinned ancestor never abruptly covers the row below it — it grows into
   * reserved space while the content stays put.
   */
  public stickyLayout(scrollTop: number, rowHeight: number, max: number): {rows: Row[]; height: number} {
    const all = this.rows.value;
    const n = all.length;
    if (max <= 0 || n === 0 || rowHeight <= 0) return {rows: [], height: 0};
    const topRow = Math.min(n - 1, Math.max(0, Math.floor(scrollTop / rowHeight)));
    const frac = scrollTop - topRow * rowHeight;
    const cur = all[topRow];
    const next = topRow + 1 < n ? all[topRow + 1] : undefined;
    // A row at depth d has d ancestor levels; the pinned height caps at `max` rows.
    const capTop = Math.min(cur.depth, max);
    const capNext = Math.min(next && !next.placeholder ? next.depth : cur.depth, max);
    const height = capTop * rowHeight + (capNext - capTop) * frac;
    if (height < 0.5) return {rows: [], height: 0};
    const anc = this.stickyAncestors(topRow, max);
    // Growing into a deeper level: the top row is the folder sliding in at the bottom.
    const rows = capNext > capTop ? [...anc, cur] : anc;
    return {rows, height};
  }

  private indexOf(id: string): number {
    const rows = this.rows.value;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.placeholder) continue;
      if (row.node.id === id) return i;
      // A compressed chain row stands in for each of its folder segments.
      if (row.chain?.some((n) => n.id === id)) return i;
    }
    return -1;
  }

  private typeAhead(char: string, fromIdx: number): void {
    const now = Date.now();
    if (now - this._taTime > TREE.TypeAheadTimeout) this._taBuffer = '';
    this._taTime = now;
    this._taBuffer += char.toLowerCase();
    const rows = this.rows.value;
    const n = rows.length;
    const start = fromIdx < 0 ? 0 : fromIdx;
    // Single-char buffer cycles to the next match; a longer buffer matches from current.
    const offset = this._taBuffer.length === 1 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      const row = rows[(start + offset + k) % n];
      if (!row.placeholder && row.node.name.toLowerCase().startsWith(this._taBuffer)) {
        this.focus(row.node.id);
        return;
      }
    }
  }

  private expandSiblings(current: Row | undefined): void {
    if (!current) return;
    const parent = this.parentOf.get(current.node.id) ?? null;
    const next = new Set(this.expanded.value);
    for (const node of this.byId.values()) {
      if ((this.parentOf.get(node.id) ?? null) === parent && isExpandable(node)) {
        next.add(node.id);
        this.ensureLoaded(node);
      }
    }
    this.setExpanded(next);
  }
}
