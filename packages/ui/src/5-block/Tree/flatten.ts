import type {TreeConnector, TreeConnectorStyle, TreeNode} from './types';

/** A placeholder row shown in place of (not-yet-available) children. */
export type RowPlaceholder = 'empty' | 'error';

/** Normalize a connector shorthand (`'dotted'`) or style object to a style object. */
export const normalizeConnector = (connector?: TreeConnector): TreeConnectorStyle | undefined =>
  connector === undefined ? undefined : typeof connector === 'string' ? {variant: connector} : connector;

/**
 * One visible row in the flattened tree. The tree renders as a flat list of
 * currently-visible rows (the VS Code model), recomputed from `roots + expanded`.
 */
export interface Row {
  /**
   * The node this row represents. For a compressed chain ({@link chain}) it is the
   * deepest (innermost) folder — the one whose children expand and whose chevron /
   * icon the row shows.
   */
  node: TreeNode;
  /**
   * Compressed folder chain (compressed mode), outermost to innermost, length >= 2.
   * `undefined` for an ordinary row. The row renders the segment names joined
   * (`a / b / c`); each segment is individually selectable.
   */
  chain?: TreeNode[];
  /** Indent level (0 for roots). */
  depth: number;
  /** Position in the flat visible list. */
  index: number;
  expanded: boolean;
  expandable: boolean;
  /**
   * Per-ancestor-level continuation flags (length `depth`). `hasNextSibling[i]`
   * is `true` when the ancestor at level `i` has a following sibling, i.e. a
   * vertical indent guide should be drawn through this row at that column.
   */
  hasNextSibling: boolean[];
  /**
   * Per-ancestor-level connector override (length `depth`). `connectors[c]` is the
   * normalized `connector` of the ancestor at depth `c` — the directory that owns
   * column `c` — so that column's guide / elbow inherits that directory's style.
   */
  connectors: (TreeConnectorStyle | undefined)[];
  /** Whether this node is the last among its siblings (drives the elbow). */
  last: boolean;
  /** 1-based position among siblings (`aria-posinset`). */
  posinset: number;
  /** Number of siblings at this level (`aria-setsize`). */
  setsize: number;
  /** Set on synthetic loading / empty / error rows. */
  placeholder?: RowPlaceholder;
}

export interface FlattenCtx {
  /**
   * Resolve the children to recurse into: the eager array, the lazily-loaded
   * cache entry, or `undefined` when a lazy node's children are not loaded yet.
   */
  resolveChildren: (node: TreeNode) => TreeNode[] | undefined;
  errored?: ReadonlySet<string>;
  /**
   * Compress chains of single-child directories into one row (`a / b / c`, the
   * VS Code "compact folders" behavior). Purely structural: independent of the
   * expanded state of the intermediate folders.
   */
  compressed?: boolean;
}

/** Whether a node can be expanded (shows a chevron). */
export const isExpandable = (node: TreeNode): boolean => {
  if (node.hasChildren || node.lazyChildren) return true;
  const children = node.children;
  return !!children && children.length > 0;
};

/** Whether a node counts as a folder for compression (a `dir`, never a `file`). */
const isFolder = (node: TreeNode): boolean => node.kind === 'dir' || (node.kind !== 'file' && isExpandable(node));

/**
 * Build the compressed folder chain starting at `node`: extend while the tail is a
 * directory whose sole child is itself a directory. Returns outermost to innermost;
 * length 1 means the node does not compress. Children that are not yet resolved
 * (lazy, unloaded) stop the chain.
 */
export const buildChain = (node: TreeNode, ctx: FlattenCtx): TreeNode[] => {
  const chain = [node];
  let tail = node;
  while (isFolder(tail)) {
    const children = ctx.resolveChildren(tail);
    if (!children || children.length !== 1) break;
    const only = children[0];
    if (!isFolder(only)) break;
    chain.push(only);
    tail = only;
  }
  return chain;
};

const placeholderNode = (parent: TreeNode, kind: RowPlaceholder): TreeNode => ({
  id: `${parent.id} ${kind}`,
  name: kind === 'error' ? 'Failed to load' : 'No items',
});

/**
 * Flatten the currently-visible nodes into a windowable `Row[]`. Pure: depends
 * only on its inputs, so it memoizes cleanly inside an `rsync.comp`.
 */
export const flatten = (roots: TreeNode[], expanded: ReadonlySet<string>, ctx: FlattenCtx): Row[] => {
  const rows: Row[] = [];
  const errored = ctx.errored;
  const walk = (
    nodes: TreeNode[],
    depth: number,
    guides: boolean[],
    connectors: (TreeConnectorStyle | undefined)[],
  ): void => {
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      const node = nodes[i];
      const last = i === len - 1;
      // Compressed mode collapses a single-child-directory chain into one row;
      // `tail` is the innermost folder that owns the chevron, children and expansion.
      const chain = ctx.compressed ? buildChain(node, ctx) : undefined;
      const tail = chain ? chain[chain.length - 1] : node;
      const expandable = isExpandable(tail);
      const isExpanded = expandable && expanded.has(tail.id);
      rows.push({
        node: tail,
        chain: chain && chain.length > 1 ? chain : undefined,
        depth,
        index: rows.length,
        expanded: isExpanded,
        expandable,
        hasNextSibling: guides,
        connectors,
        last,
        posinset: i + 1,
        setsize: len,
      });
      if (!isExpanded) continue;
      const childGuides = guides.concat(!last);
      const childConnectors = connectors.concat(normalizeConnector(tail.connector));
      const children = ctx.resolveChildren(tail);
      if (children) {
        if (children.length) walk(children, depth + 1, childGuides, childConnectors);
        else pushPlaceholder('empty', tail, depth + 1, childGuides, childConnectors);
      } else if (errored?.has(tail.id)) {
        pushPlaceholder('error', tail, depth + 1, childGuides, childConnectors);
      }
      // While children are loading, no placeholder row is inserted; the expanding
      // directory shows a spinner in its own chevron instead (see TreeRow).
    }
  };
  const pushPlaceholder = (
    kind: RowPlaceholder,
    parent: TreeNode,
    depth: number,
    guides: boolean[],
    connectors: (TreeConnectorStyle | undefined)[],
  ): void => {
    rows.push({
      node: placeholderNode(parent, kind),
      depth,
      index: rows.length,
      expanded: false,
      expandable: false,
      hasNextSibling: guides,
      connectors,
      last: true,
      posinset: 1,
      setsize: 1,
      placeholder: kind,
    });
  };
  walk(roots, 0, [], []);
  return rows;
};
