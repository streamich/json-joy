import {describe, expect, it} from 'vitest';
import {buildChain, type FlattenCtx, flatten, isExpandable, normalizeConnector} from './flatten';
import type {TreeNode} from './types';

const ctx = (overrides: Partial<FlattenCtx> = {}): FlattenCtx => ({
  resolveChildren: (node) => (Array.isArray(node.children) ? node.children : undefined),
  ...overrides,
});

const tree: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'dir',
    children: [
      {id: 'src/a.ts', name: 'a.ts', kind: 'file'},
      {
        id: 'src/lib',
        name: 'lib',
        kind: 'dir',
        children: [{id: 'src/lib/b.ts', name: 'b.ts', kind: 'file'}],
      },
    ],
  },
  {id: 'readme', name: 'README.md', kind: 'file'},
];

describe('isExpandable', () => {
  it('is true for a non-empty children array', () => {
    expect(isExpandable({id: '1', name: 'x', children: [{id: '2', name: 'y'}]})).toBe(true);
  });
  it('is false for an empty children array', () => {
    expect(isExpandable({id: '1', name: 'x', children: []})).toBe(false);
  });
  it('is true for a lazy loader function', () => {
    expect(isExpandable({id: '1', name: 'x', lazyChildren: async () => []})).toBe(true);
  });
  it('is true when hasChildren is set', () => {
    expect(isExpandable({id: '1', name: 'x', hasChildren: true})).toBe(true);
  });
  it('is false for a leaf', () => {
    expect(isExpandable({id: '1', name: 'x'})).toBe(false);
  });
});

describe('flatten', () => {
  it('shows only roots when nothing is expanded', () => {
    const rows = flatten(tree, new Set(), ctx());
    expect(rows.map((r) => r.node.id)).toEqual(['src', 'readme']);
    expect(rows[0].depth).toBe(0);
    expect(rows[0].expandable).toBe(true);
    expect(rows[0].expanded).toBe(false);
    expect(rows[1].expandable).toBe(false);
  });

  it('reveals children of expanded nodes in pre-order', () => {
    const rows = flatten(tree, new Set(['src']), ctx());
    expect(rows.map((r) => r.node.id)).toEqual(['src', 'src/a.ts', 'src/lib', 'readme']);
    expect(rows[1].depth).toBe(1);
    expect(rows[2].depth).toBe(1);
  });

  it('recurses into nested expanded nodes', () => {
    const rows = flatten(tree, new Set(['src', 'src/lib']), ctx());
    expect(rows.map((r) => r.node.id)).toEqual(['src', 'src/a.ts', 'src/lib', 'src/lib/b.ts', 'readme']);
    expect(rows[3].depth).toBe(2);
  });

  it('assigns sequential indexes and ARIA pos/setsize', () => {
    const rows = flatten(tree, new Set(['src']), ctx());
    expect(rows.map((r) => r.index)).toEqual([0, 1, 2, 3]);
    // src is 1st of 2 roots; a.ts is 1st of 2 children; lib is 2nd of 2.
    expect(rows[0]).toMatchObject({posinset: 1, setsize: 2});
    expect(rows[1]).toMatchObject({posinset: 1, setsize: 2});
    expect(rows[2]).toMatchObject({posinset: 2, setsize: 2});
  });

  it('computes ancestor guide flags and last-child markers', () => {
    const rows = flatten(tree, new Set(['src', 'src/lib']), ctx());
    const byId = Object.fromEntries(rows.map((r) => [r.node.id, r]));
    // src is NOT the last root (readme follows), so last = false.
    expect(byId.src.last).toBe(false);
    expect(byId.src.hasNextSibling).toEqual([]);
    // a.ts: ancestor src has a following sibling (readme), so guide[0] = true.
    expect(byId['src/a.ts'].hasNextSibling).toEqual([true]);
    expect(byId['src/a.ts'].last).toBe(false);
    // lib is the last child of src, so last = true.
    expect(byId['src/lib'].last).toBe(true);
    // b.ts at depth 2: [src continues, lib does NOT continue].
    expect(byId['src/lib/b.ts'].hasNextSibling).toEqual([true, false]);
    expect(byId['src/lib/b.ts'].last).toBe(true);
  });

  it('inserts no placeholder row while children are loading', () => {
    const lazy: TreeNode[] = [{id: 'd', name: 'd', hasChildren: true, lazyChildren: async () => []}];
    const rows = flatten(lazy, new Set(['d']), ctx());
    // No synthetic "Loading…" row: the directory shows a spinner in its own
    // chevron (TreeRow), so the flattened list holds only the directory itself.
    expect(rows.map((r) => r.node.id)).toEqual(['d']);
    expect(rows.map((r) => r.placeholder)).toEqual([undefined]);
  });

  it('emits an empty placeholder when loaded children are empty', () => {
    const lazy: TreeNode[] = [{id: 'd', name: 'd', hasChildren: true, lazyChildren: async () => []}];
    const rows = flatten(lazy, new Set(['d']), ctx({resolveChildren: () => []}));
    expect(rows[1].placeholder).toBe('empty');
  });

  it('emits an error placeholder for a failed lazy node', () => {
    const lazy: TreeNode[] = [{id: 'd', name: 'd', hasChildren: true, lazyChildren: async () => []}];
    const rows = flatten(lazy, new Set(['d']), ctx({errored: new Set(['d'])}));
    expect(rows[1].placeholder).toBe('error');
  });

  it('does not recurse into collapsed nodes even if expanded set names a descendant', () => {
    const rows = flatten(tree, new Set(['src/lib']), ctx());
    // src is collapsed, so src/lib is never reached.
    expect(rows.map((r) => r.node.id)).toEqual(['src', 'readme']);
  });
});

describe('flatten — compressed folders', () => {
  const compressedTree: TreeNode[] = [
    {
      id: 'a',
      name: 'a',
      kind: 'dir',
      children: [
        {
          id: 'a/b',
          name: 'b',
          kind: 'dir',
          children: [
            {
              id: 'a/b/c',
              name: 'c',
              kind: 'dir',
              children: [
                {id: 'a/b/c/f1', name: 'f1.ts', kind: 'file'},
                {id: 'a/b/c/f2', name: 'f2.ts', kind: 'file'},
              ],
            },
          ],
        },
      ],
    },
  ];

  it('buildChain follows single-child directory chains', () => {
    expect(buildChain(compressedTree[0], ctx()).map((n) => n.id)).toEqual(['a', 'a/b', 'a/b/c']);
  });

  it('does not compress without the compressed flag', () => {
    const rows = flatten(compressedTree, new Set(), ctx());
    expect(rows.map((r) => r.node.id)).toEqual(['a']);
    expect(rows[0].chain).toBeUndefined();
  });

  it('compresses a single-child chain into one collapsed row', () => {
    const rows = flatten(compressedTree, new Set(), ctx({compressed: true}));
    expect(rows).toHaveLength(1);
    const row = rows[0];
    // The row represents the deepest folder; the chain holds every segment.
    expect(row.node.id).toBe('a/b/c');
    expect(row.chain?.map((n) => n.id)).toEqual(['a', 'a/b', 'a/b/c']);
    expect(row.depth).toBe(0);
    expect(row.expandable).toBe(true);
    expect(row.expanded).toBe(false);
  });

  it('expanding the deepest folder reveals its children one level in', () => {
    const rows = flatten(compressedTree, new Set(['a/b/c']), ctx({compressed: true}));
    expect(rows.map((r) => r.node.id)).toEqual(['a/b/c', 'a/b/c/f1', 'a/b/c/f2']);
    expect(rows[0].depth).toBe(0);
    // Children sit one indent level below the single compressed row.
    expect(rows[1].depth).toBe(1);
    expect(rows[2].depth).toBe(1);
  });

  it('stops compressing at a folder with multiple children', () => {
    const tree2: TreeNode[] = [
      {
        id: 'a',
        name: 'a',
        kind: 'dir',
        children: [
          {
            id: 'a/b',
            name: 'b',
            kind: 'dir',
            children: [
              {id: 'a/b/x', name: 'x', kind: 'dir', children: [{id: 'a/b/x/f', name: 'f', kind: 'file'}]},
              {id: 'a/b/y', name: 'y.ts', kind: 'file'},
            ],
          },
        ],
      },
    ];
    expect(buildChain(tree2[0], ctx()).map((n) => n.id)).toEqual(['a', 'a/b']);
  });

  it('does not compress when the only child is a file', () => {
    const tree3: TreeNode[] = [
      {id: 'a', name: 'a', kind: 'dir', children: [{id: 'a/only', name: 'only.ts', kind: 'file'}]},
    ];
    expect(buildChain(tree3[0], ctx()).map((n) => n.id)).toEqual(['a']);
    expect(flatten(tree3, new Set(), ctx({compressed: true}))[0].chain).toBeUndefined();
  });
});

describe('normalizeConnector', () => {
  it('expands a variant shorthand to a style object', () => {
    expect(normalizeConnector('dotted')).toEqual({variant: 'dotted'});
  });
  it('passes a style object through and leaves undefined alone', () => {
    const style = {variant: 'squiggly' as const, amplitude: 2};
    expect(normalizeConnector(style)).toBe(style);
    expect(normalizeConnector(undefined)).toBeUndefined();
  });
});

describe('flatten — per-column connector overrides', () => {
  const connectorTree: TreeNode[] = [
    {
      id: 'D',
      name: 'D',
      kind: 'dir',
      connector: {variant: 'dotted'},
      children: [
        {id: 'D/f', name: 'f', kind: 'file', connector: {variant: 'dashed'}},
        {
          id: 'D/E',
          name: 'E',
          kind: 'dir',
          connector: 'squiggly',
          children: [{id: 'D/E/g', name: 'g', kind: 'file'}],
        },
      ],
    },
  ];

  it('threads each ancestor directory override into connectors[depth]', () => {
    const rows = flatten(connectorTree, new Set(['D', 'D/E']), ctx());
    const byId = Object.fromEntries(rows.map((r) => [r.node.id, r]));
    // Root D owns no column.
    expect(byId.D.connectors).toEqual([]);
    // Children of D inherit D's override at column 0 (the directory that owns it).
    expect(byId['D/f'].connectors).toEqual([{variant: 'dotted'}]);
    expect(byId['D/E'].connectors).toEqual([{variant: 'dotted'}]);
    // Grandchild: column 0 = D, column 1 = E (shorthand normalized).
    expect(byId['D/E/g'].connectors).toEqual([{variant: 'dotted'}, {variant: 'squiggly'}]);
    // The file's OWN override stays on its node (used only for its own stub).
    expect(byId['D/f'].node.connector).toEqual({variant: 'dashed'});
  });
});
