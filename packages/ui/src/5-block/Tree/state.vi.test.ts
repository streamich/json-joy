import {describe, expect, it, vi} from 'vitest';
import {TreeState} from './state';
import type {TreeNode, TreeStateOpts} from './types';

const tree: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'dir',
    children: [
      {id: 'src/app.ts', name: 'app.ts', kind: 'file'},
      {id: 'src/lib', name: 'lib', kind: 'dir', children: [{id: 'src/lib/util.ts', name: 'util.ts', kind: 'file'}]},
    ],
  },
  {id: 'package.json', name: 'package.json', kind: 'file'},
  {id: 'readme', name: 'README.md', kind: 'file'},
];

const make = (opts: Partial<TreeStateOpts> = {}) => new TreeState({roots: tree, ...opts});

const key = (k: string, mods: Partial<KeyboardEvent> = {}) =>
  ({key: k, preventDefault: () => {}, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods}) as any;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('TreeState — expansion', () => {
  it('toggles a node open and closed and fires onExpandedChange', () => {
    const onExpandedChange = vi.fn();
    const s = make({onExpandedChange});
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['src', 'package.json', 'readme']);
    s.toggle('src');
    expect(s.expanded.value.has('src')).toBe(true);
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['src', 'src/app.ts', 'src/lib', 'package.json', 'readme']);
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    s.toggle('src');
    expect(s.expanded.value.has('src')).toBe(false);
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['src', 'package.json', 'readme']);
  });

  it('expandAll opens every expandable node; collapseAll closes everything', () => {
    const s = make();
    s.expandAll();
    expect(s.rows.value.map((r) => r.node.id)).toEqual([
      'src',
      'src/app.ts',
      'src/lib',
      'src/lib/util.ts',
      'package.json',
      'readme',
    ]);
    s.collapseAll();
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['src', 'package.json', 'readme']);
  });

  it('reveal expands all ancestors and focuses the node', () => {
    const onFocusChange = vi.fn();
    const s = make({onFocusChange});
    s.reveal('src/lib/util.ts');
    expect(s.expanded.value.has('src')).toBe(true);
    expect(s.expanded.value.has('src/lib')).toBe(true);
    expect(s.focused.value).toBe('src/lib/util.ts');
    expect(onFocusChange).toHaveBeenLastCalledWith('src/lib/util.ts');
  });
});

describe('TreeState — selection', () => {
  it('single selection replaces the set', () => {
    const onSelectionChange = vi.fn();
    const s = make({selection: 'single', onSelectionChange});
    s.select('package.json');
    expect([...s.selected.value]).toEqual(['package.json']);
    s.select('readme');
    expect([...s.selected.value]).toEqual(['readme']);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it('multi toggle adds and removes ids', () => {
    const s = make({selection: 'multi'});
    s.select('package.json', 'toggle');
    s.select('readme', 'toggle');
    expect(new Set(s.selected.value)).toEqual(new Set(['package.json', 'readme']));
    s.select('package.json', 'toggle');
    expect([...s.selected.value]).toEqual(['readme']);
  });

  it('range selection spans the flat list from the anchor', () => {
    const s = make({selection: 'multi'});
    s.toggle('src'); // src, app.ts, lib, package.json, readme
    s.select('src/app.ts'); // anchor
    s.select('package.json', 'range');
    expect(new Set(s.selected.value)).toEqual(new Set(['src/app.ts', 'src/lib', 'package.json']));
  });

  it('selection="none" ignores selection', () => {
    const s = make({selection: 'none'});
    s.select('readme');
    expect(s.selected.value.size).toBe(0);
  });
});

describe('TreeState — keyboard navigation', () => {
  it('ArrowDown / ArrowUp move focus over visible rows', () => {
    const s = make();
    s.onKeyDown(key('ArrowDown'));
    expect(s.focused.value).toBe('src');
    s.onKeyDown(key('ArrowDown'));
    expect(s.focused.value).toBe('package.json');
    s.onKeyDown(key('ArrowUp'));
    expect(s.focused.value).toBe('src');
  });

  it('ArrowRight expands a collapsed node, then steps into the first child', () => {
    const s = make();
    s.focus('src');
    s.onKeyDown(key('ArrowRight'));
    expect(s.expanded.value.has('src')).toBe(true);
    expect(s.focused.value).toBe('src');
    s.onKeyDown(key('ArrowRight'));
    expect(s.focused.value).toBe('src/app.ts');
  });

  it('ArrowLeft collapses an expanded node, else moves to the parent', () => {
    const s = make();
    s.toggle('src');
    s.focus('src/app.ts');
    s.onKeyDown(key('ArrowLeft'));
    expect(s.focused.value).toBe('src');
    s.onKeyDown(key('ArrowLeft'));
    expect(s.expanded.value.has('src')).toBe(false);
  });

  it('Home / End jump to first / last visible row', () => {
    const s = make();
    s.focus('package.json');
    s.onKeyDown(key('Home'));
    expect(s.focused.value).toBe('src');
    s.onKeyDown(key('End'));
    expect(s.focused.value).toBe('readme');
  });

  it('Enter activates the focused node', () => {
    const onActivate = vi.fn();
    const s = make({onActivate});
    s.focus('readme');
    s.onKeyDown(key('Enter'));
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({id: 'readme'}), expect.anything());
  });

  it('type-ahead focuses a row whose name matches the typed prefix', () => {
    const s = make();
    s.onKeyDown(key('r')); // README.md
    expect(s.focused.value).toBe('readme');
  });

  it('type-ahead accumulates a multi-char buffer within the timeout window', () => {
    const s = make();
    s.onKeyDown(key('p'));
    expect(s.focused.value).toBe('package.json');
    s.onKeyDown(key('a')); // buffer "pa" still matches package.json
    expect(s.focused.value).toBe('package.json');
    s.onKeyDown(key('x')); // buffer "pax" matches nothing, so focus unchanged
    expect(s.focused.value).toBe('package.json');
  });
});

describe('TreeState — lazy loading', () => {
  it('loads children on expand and renders them', async () => {
    const loadChildren = vi.fn(async (node: TreeNode) => [
      {id: `${node.id}/child`, name: 'child.ts', kind: 'file'} as TreeNode,
    ]);
    const roots: TreeNode[] = [{id: 'lazy', name: 'lazy', hasChildren: true}];
    const s = new TreeState({roots, loadChildren});
    s.toggle('lazy');
    expect(s.loading.value.has('lazy')).toBe(true);
    // While loading, no placeholder row is inserted; the directory's own chevron
    // shows a spinner (TreeRow), so the flattened rows hold just the directory.
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['lazy']);
    expect(s.rows.value.some((r) => r.placeholder)).toBe(false);
    await flush();
    expect(loadChildren).toHaveBeenCalledOnce();
    expect(s.loading.value.has('lazy')).toBe(false);
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['lazy', 'lazy/child']);
  });

  it('marks a node errored when its loader rejects', async () => {
    const loadChildren = vi.fn(async () => {
      throw new Error('boom');
    });
    const roots: TreeNode[] = [{id: 'lazy', name: 'lazy', hasChildren: true}];
    const s = new TreeState({roots, loadChildren});
    s.toggle('lazy');
    await flush();
    expect(s.errored.value.has('lazy')).toBe(true);
    expect(s.rows.value.map((r) => r.placeholder)).toContain('error');
  });

  it("loads a node's own lazyChildren on expand (no tree-wide loader needed)", async () => {
    const lazyChildren = vi.fn(async () => [{id: 'L/a', name: 'a.ts', kind: 'file'} as TreeNode]);
    const roots: TreeNode[] = [{id: 'L', name: 'L', lazyChildren}];
    const s = new TreeState({roots});
    s.toggle('L');
    await flush();
    expect(lazyChildren).toHaveBeenCalledOnce();
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['L', 'L/a']);
  });
});

describe('TreeState — compressed folders', () => {
  const roots: TreeNode[] = [
    {
      id: 'a',
      name: 'a',
      kind: 'dir',
      children: [
        {
          id: 'a/b',
          name: 'b',
          kind: 'dir',
          children: [{id: 'a/b/c', name: 'c', kind: 'dir', children: [{id: 'a/b/c/f', name: 'f.ts', kind: 'file'}]}],
        },
      ],
    },
  ];

  it('renders one compressed row for a single-child chain', () => {
    const s = new TreeState({roots, compressed: true});
    expect(s.rows.value).toHaveLength(1);
    expect(s.rows.value[0].chain?.map((n) => n.id)).toEqual(['a', 'a/b', 'a/b/c']);
  });

  it('reveal of a leaf expands the chain and focuses the leaf', () => {
    const s = new TreeState({roots, compressed: true});
    s.reveal('a/b/c/f');
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['a/b/c', 'a/b/c/f']);
    expect(s.focused.value).toBe('a/b/c/f');
  });

  it('toggling compressed off restores the per-level rows', () => {
    const s = new TreeState({roots, compressed: true, expanded: ['a', 'a/b', 'a/b/c']});
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['a/b/c', 'a/b/c/f']);
    s.setLayout({compressed: false});
    expect(s.rows.value.map((r) => r.node.id)).toEqual(['a', 'a/b', 'a/b/c', 'a/b/c/f']);
  });
});

describe('TreeState — sticky ancestors', () => {
  const roots: TreeNode[] = [
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
                {id: 'a/b/c/f1', name: 'f1', kind: 'file'},
                {id: 'a/b/c/f2', name: 'f2', kind: 'file'},
              ],
            },
          ],
        },
      ],
    },
  ];
  // rows when fully expanded: [a(0), a/b(1), a/b/c(2), f1(3), f2(4)].
  const expanded = ['a', 'a/b', 'a/b/c'];

  it('normalizes the stickyAncestors option to a max-count', () => {
    expect(new TreeState({roots}).stickyMax$.value).toBe(0);
    expect(new TreeState({roots, stickyAncestors: true}).stickyMax$.value).toBe(5);
    expect(new TreeState({roots, stickyAncestors: 3}).stickyMax$.value).toBe(3);
  });

  it('returns the anchor row ancestor chain, root-most first', () => {
    const s = new TreeState({roots, expanded});
    expect(s.stickyAncestors(4, 10).map((r) => r.node.id)).toEqual(['a', 'a/b', 'a/b/c']);
  });

  it('returns nothing for a root-level anchor', () => {
    const s = new TreeState({roots, expanded});
    expect(s.stickyAncestors(0, 10)).toEqual([]);
  });

  it('caps to the deepest N ancestors (drops the outermost)', () => {
    const s = new TreeState({roots, expanded});
    expect(s.stickyAncestors(4, 2).map((r) => r.node.id)).toEqual(['a/b', 'a/b/c']);
  });

  it('stickyLayout grows the overlay height continuously as folders scroll in', () => {
    const s = new TreeState({roots, expanded});
    // rows: a(0) a/b(1) a/b/c(2) f1(3) f2(4); rowHeight 10.
    expect(s.stickyLayout(0, 10, 10)).toEqual({rows: [], height: 0});
    // Scrolling 5px into root `a` (depth 0 -> child depth 1): a is half slid in.
    const at5 = s.stickyLayout(5, 10, 10);
    expect(at5.rows.map((r) => r.node.id)).toEqual(['a']);
    expect(at5.height).toBe(5);
    // 5px into `a/b`'s slot: [a] full, a/b sliding in -> 1.5 rows of height.
    const at15 = s.stickyLayout(15, 10, 10);
    expect(at15.rows.map((r) => r.node.id)).toEqual(['a', 'a/b']);
    expect(at15.height).toBe(15);
    // Among the leaf files: the full chain pins at a stable height (no slide).
    const at35 = s.stickyLayout(35, 10, 10);
    expect(at35.rows.map((r) => r.node.id)).toEqual(['a', 'a/b', 'a/b/c']);
    expect(at35.height).toBe(30);
  });
});

describe('TreeState — disabled predicate', () => {
  it('blocks activation and click-selection for disabled nodes', () => {
    const onActivate = vi.fn();
    const s = make({disabled: (n) => n.id === 'readme', onActivate});
    expect(s.isDisabled({id: 'readme', name: 'x'})).toBe(true);
    expect(s.isDisabled({id: 'package.json', name: 'x'})).toBe(false);
    s.activate('readme', {} as any);
    expect(onActivate).not.toHaveBeenCalled();
    s.onRowClick('readme', {} as any);
    expect(s.selected.value.has('readme')).toBe(false);
    // A non-disabled node still selects.
    s.onRowClick('package.json', {} as any);
    expect(s.selected.value.has('package.json')).toBe(true);
  });
});
