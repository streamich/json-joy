import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {Tree} from './Tree';
import type {TreeHandle, TreeNode} from './types';

const meta: Meta = {
  title: '5. Block/Tree',
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const frame: React.CSSProperties = {
  width: 420,
  border: '1px solid rgba(0,0,0,0.12)',
  padding: 4,
  borderRadius: 8,
  overflow: 'hidden',
};

const files: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'dir',
    children: [
      {
        id: 'src/components',
        name: 'components',
        kind: 'dir',
        children: [
          {id: 'src/components/Button.tsx', name: 'Button.tsx', kind: 'file', ext: 'tsx'},
          {id: 'src/components/Modal.tsx', name: 'Modal.tsx', kind: 'file', ext: 'tsx'},
          {
            id: 'src/components/VeryLongComponentNameThatWillBeTruncated.tsx',
            name: 'VeryLongComponentNameThatWillBeTruncated.tsx',
            kind: 'file',
            ext: 'tsx',
          },
        ],
      },
      {id: 'src/index.ts', name: 'index.ts', kind: 'file', ext: 'ts'},
      {id: 'src/state.ts', name: 'state.ts', kind: 'file', ext: 'ts'},
    ],
  },
  {
    id: 'node_modules',
    name: 'node_modules',
    kind: 'dir',
    dim: true,
    children: [{id: 'node_modules/react', name: 'react', kind: 'dir', dim: true, children: []}],
  },
  {id: '.gitignore', name: '.gitignore', kind: 'file', dim: true, ext: 'txt'},
  {id: 'package.json', name: 'package.json', kind: 'file', ext: 'json'},
  {id: 'README.md', name: 'README.md', kind: 'file', ext: 'md'},
];

/** A small file tree with the default solid connector guides. */
export const FileTree: StoryObj = {
  render: () => <Tree roots={files} defaultExpanded={['src', 'src/components']} style={frame} aria-label="Files" />,
};

/** Tree-wide connector variant: none / solid / dashed / dotted / squiggly. */
export const ConnectorLines: StoryObj = {
  render: () => {
    const variants = ['none', 'solid', 'dashed', 'dotted', 'squiggly'] as const;
    const [lines, setLines] = React.useState<(typeof variants)[number]>('solid');
    return (
      <div>
        <div style={{marginBottom: 8, font: '13px sans-serif', display: 'flex', gap: 8}}>
          {variants.map((l) => (
            <label key={l}>
              <input type="radio" checked={lines === l} onChange={() => setLines(l)} /> {l}
            </label>
          ))}
        </div>
        <Tree roots={files} lines={lines} defaultExpanded={['src', 'src/components']} style={frame} />
      </div>
    );
  },
};

/** Tree-wide squiggle, with an "amplitude" (how squiggly) slider + a color. */
export const SquigglyAmplitude: StoryObj = {
  render: () => {
    const [amplitude, setAmplitude] = React.useState(1.5);
    return (
      <div>
        <label style={{display: 'block', marginBottom: 8, font: '13px sans-serif'}}>
          amplitude {amplitude.toFixed(1)}{' '}
          <input
            type="range"
            min={0}
            max={4}
            step={0.5}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </label>
        <Tree
          roots={files}
          lines={{variant: 'squiggly', amplitude, wavelength: 6, color: '#7c3aed'}}
          defaultExpanded={['src', 'src/components']}
          style={frame}
        />
      </div>
    );
  },
};

/**
 * Per-node connector overrides. A directory override cascades to all its
 * children's vertical guide + elbows; a file override styles only that file's own
 * horizontal stub. Here `src` is dotted-blue for its whole subtree, `index.ts`
 * overrides just its own stub to dashed-red, and `lib` is squiggly-green.
 */
export const PerNodeConnectors: StoryObj = {
  render: () => {
    const roots: TreeNode[] = [
      {
        id: 'src',
        name: 'src',
        kind: 'dir',
        connector: {variant: 'dotted', color: '#2563eb'},
        children: [
          {id: 'src/a.ts', name: 'a.ts', kind: 'file', ext: 'ts'},
          {
            id: 'src/index.ts',
            name: 'index.ts',
            kind: 'file',
            ext: 'ts',
            connector: {variant: 'dashed', color: '#e5484d'},
          },
          {
            id: 'src/lib',
            name: 'lib',
            kind: 'dir',
            connector: {variant: 'squiggly', color: '#16a34a', amplitude: 1.6},
            children: [
              {id: 'src/lib/x.ts', name: 'x.ts', kind: 'file', ext: 'ts'},
              {id: 'src/lib/y.ts', name: 'y.ts', kind: 'file', ext: 'ts'},
            ],
          },
        ],
      },
      {id: 'readme', name: 'README.md', kind: 'file', ext: 'md'},
    ];
    return <Tree roots={roots} defaultExpanded={['src', 'src/lib']} style={frame} />;
  },
};

/** Connector guides revealed only on row hover (the "switcher: show-on-hover"). */
export const LinesOnHover: StoryObj = {
  render: () => <Tree roots={files} linesSwitcher="hover" defaultExpanded={['src', 'src/components']} style={frame} />,
};

/** Only vertical indent guides, no horizontal elbow stubs (`elbow: false`). */
export const VerticalGuidesOnly: StoryObj = {
  render: () => (
    <Tree
      roots={files}
      lines={{variant: 'solid', elbow: false}}
      defaultExpanded={['src', 'src/components']}
      style={frame}
    />
  ),
};

/** Multi-select with a checkbox before each icon. */
export const Checkboxes: StoryObj = {
  render: () => (
    <Tree roots={files} checkboxes selection="multi" defaultExpanded={['src', 'src/components']} style={frame} />
  ),
};

/** Dimmed rows for gitignored / hidden entries (`dim: true`). */
export const DimmedRows: StoryObj = {
  render: () => <Tree roots={files} defaultExpanded={['src', 'node_modules']} style={frame} />,
};

/** Disabled nodes via a tree-level predicate: `.tsx` files are dimmed and inert. */
export const DisabledNodes: StoryObj = {
  render: () => (
    <Tree
      roots={files}
      defaultExpanded={['src', 'src/components']}
      disabled={(node) => node.name.endsWith('.tsx')}
      onActivate={(node) => alert(`activated ${node.name}`)}
      style={frame}
    />
  ),
};

/**
 * Custom per-node icons via `node.icon(props)` (inherited from `MenuItem`). When
 * set it overrides the default file/dir icon; nodes without it fall back as usual.
 * The function is passed `{width, height}` sized to the icon column, so an SVG can
 * spread the props straight onto itself.
 */
export const CustomIcons: StoryObj = {
  render: () => {
    const star = (props?: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" {...props}>
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" fill="#f5b301" />
      </svg>
    );
    const statusDot = (color: string) => (props?: React.SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 16 16" {...props}>
        <circle cx={8} cy={8} r={5} fill={color} />
      </svg>
    );
    const emoji = (glyph: string) => () => <span style={{fontSize: 14, lineHeight: 1}}>{glyph}</span>;
    const roots: TreeNode[] = [
      {
        id: 'fav',
        name: 'favorites',
        kind: 'dir',
        icon: star, // custom folder icon
        children: [
          {id: 'fav/readme', name: 'readme.md', icon: emoji('📝')},
          {id: 'fav/pkg', name: 'package', icon: emoji('📦')},
          {id: 'fav/plain', name: 'plain.ts', kind: 'file', ext: 'ts'}, // no icon: falls back to FileIcon
        ],
      },
      {id: 'ok', name: 'build-ok.log', icon: statusDot('#3fb950')},
      {id: 'warn', name: 'build-warn.log', icon: statusDot('#d29922')},
      {id: 'default', name: 'no-custom-icon.ts', kind: 'file', ext: 'ts'}, // falls back to FileIcon
    ];
    return <Tree roots={roots} defaultExpanded={['fav']} style={frame} />;
  },
};

/** Right-aligned decorations (git tint + colored status dots + a count badge). */
export const Decorations: StoryObj = {
  render: () => {
    const decorated: TreeNode[] = [
      {
        id: 'src',
        name: 'src',
        kind: 'dir',
        decorations: [{label: 3}],
        children: [
          {id: 'src/a.ts', name: 'a.ts', kind: 'file', ext: 'ts', decorations: [{tint: '#3fb950', dot: 'success'}]},
          {id: 'src/b.ts', name: 'b.ts', kind: 'file', ext: 'ts', decorations: [{tint: '#d29922', dot: 'warning'}]},
          {id: 'src/c.ts', name: 'c.ts', kind: 'file', ext: 'ts', decorations: [{tint: '#f85149', dot: 'error'}]},
        ],
      },
    ];
    return <Tree roots={decorated} defaultExpanded={['src']} style={frame} />;
  },
};

/** Hover-revealed action button per row (composed from `BasicButton`). */
export const RowActions: StoryObj = {
  render: () => (
    <Tree
      roots={files}
      defaultExpanded={['src']}
      renderActions={(node) => <BasicButtonMore size={22} onClick={() => alert(`Menu for ${node.name}`)} />}
      style={frame}
    />
  ),
};

/** Custom row-background highlight hook (rainbow by depth). */
export const CustomHighlight: StoryObj = {
  render: () => {
    const hues = ['rgba(255,107,107,0.16)', 'rgba(255,193,7,0.16)', 'rgba(75,192,140,0.16)', 'rgba(86,156,255,0.16)'];
    return (
      <Tree
        roots={files}
        defaultExpanded={['src', 'src/components']}
        renderRowBackground={(row, flags) => (flags.selected ? undefined : hues[row.depth % hues.length])}
        style={frame}
      />
    );
  },
};

/** Lazy children: each folder loads on first expand (800ms stub). */
export const LazyChildren: StoryObj = {
  render: () => {
    const roots: TreeNode[] = [
      {id: '0', name: 'folder-0', hasChildren: true},
      {id: '1', name: 'folder-1', hasChildren: true},
      {id: '2', name: 'folder-2', hasChildren: true},
    ];
    const loadChildren = (node: TreeNode): Promise<TreeNode[]> =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve([
              {id: `${node.id}/a`, name: 'lazy-a.ts', kind: 'file', ext: 'ts'},
              {id: `${node.id}/sub`, name: 'lazy-sub', hasChildren: true},
            ]),
          800,
        ),
      );
    return <Tree roots={roots} loadChildren={loadChildren} style={frame} />;
  },
};

// Deterministic deep tree generator (no allocation surprises in the doc).
const buildDeep = (prefix: string, depth: number, breadth: number): TreeNode[] =>
  Array.from({length: breadth}, (_, i) => {
    const id = `${prefix}/${i}`;
    const isDir = depth > 0 && i % 2 === 0;
    return isDir
      ? {id, name: `dir-${i}`, kind: 'dir', children: buildDeep(id, depth - 1, breadth)}
      : {id, name: `file-${i}.ts`, kind: 'file', ext: 'ts'};
  });

/** A deep, wide tree to eyeball indentation + connector guides at depth. */
export const DeepTree: StoryObj = {
  render: () => {
    const roots = React.useMemo(() => buildDeep('n', 5, 4), []);
    const expanded = React.useMemo(() => {
      // Expand the left spine.
      const ids: string[] = [];
      let p = 'n/0';
      for (let d = 0; d < 5; d++) {
        ids.push(p);
        p = `${p}/0`;
      }
      return ids;
    }, []);
    return <Tree roots={roots} defaultExpanded={expanded} height={420} style={frame} />;
  },
};

/** 100k nodes, virtualized — only the visible window is in the DOM. */
export const HundredThousandNodes: StoryObj = {
  render: () => {
    const roots = React.useMemo<TreeNode[]>(
      () =>
        Array.from({length: 1000}, (_, d) => ({
          id: `d${d}`,
          name: `dir-${d}`,
          kind: 'dir',
          children: Array.from({length: 100}, (_, f) => ({
            id: `d${d}/f${f}`,
            name: `file-${f}.ts`,
            kind: 'file' as const,
            ext: 'ts',
          })),
        })),
      [],
    );
    const allExpanded = React.useMemo(() => roots.map((r) => r.id), [roots]);
    return <Tree roots={roots} defaultExpanded={allExpanded} height={440} style={frame} aria-label="100k nodes" />;
  },
};

/** Imperative ref: reveal + briefly flash a deep node. */
export const RevealAndFlash: StoryObj = {
  render: () => {
    const ref = React.useRef<TreeHandle>(null);
    const roots = React.useMemo(() => buildDeep('n', 5, 4), []);
    const target = 'n/0/0/0/0/0/0';
    return (
      <div>
        <div style={{marginBottom: 8, display: 'flex', gap: 8}}>
          <button type="button" onClick={() => ref.current?.flash(target)}>
            reveal + flash deep node
          </button>
          <button type="button" onClick={() => ref.current?.collapseAll()}>
            collapse all
          </button>
          <button type="button" onClick={() => ref.current?.expandAll()}>
            expand all
          </button>
        </div>
        <Tree ref={ref} roots={roots} height={420} style={frame} />
      </div>
    );
  },
};

// A Java-style package layout: long runs of single-child folders that compression
// collapses into one `com / example / app` row.
const packages: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'dir',
    children: [
      {
        id: 'src/main',
        name: 'main',
        kind: 'dir',
        children: [
          {
            id: 'src/main/java',
            name: 'java',
            kind: 'dir',
            children: [
              {
                id: 'src/main/java/com',
                name: 'com',
                kind: 'dir',
                children: [
                  {
                    id: 'src/main/java/com/example',
                    name: 'example',
                    kind: 'dir',
                    children: [
                      {
                        id: 'src/main/java/com/example/app',
                        name: 'app',
                        kind: 'dir',
                        children: [
                          {id: 'src/main/java/com/example/app/App.java', name: 'App.java', kind: 'file', ext: 'java'},
                          {id: 'src/main/java/com/example/app/Main.java', name: 'Main.java', kind: 'file', ext: 'java'},
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'src/test',
        name: 'test',
        kind: 'dir',
        children: [
          {
            id: 'src/test/java',
            name: 'java',
            kind: 'dir',
            children: [{id: 'src/test/java/AppTest.java', name: 'AppTest.java', kind: 'file', ext: 'java'}],
          },
        ],
      },
    ],
  },
];

const allDirs = [
  'src',
  'src/main',
  'src/main/java',
  'src/main/java/com',
  'src/main/java/com/example',
  'src/main/java/com/example/app',
  'src/test',
  'src/test/java',
];

/**
 * Compressed folders: chains of single-child directories collapse into one
 * `com / example / app` row (the VS Code "compact folders" behavior). Each path
 * segment stays individually clickable. Toggle it on and off to compare.
 */
export const CompressedFolders: StoryObj = {
  render: () => {
    const [compressed, setCompressed] = React.useState(true);
    return (
      <div>
        <label style={{display: 'block', marginBottom: 8, font: '13px sans-serif'}}>
          <input type="checkbox" checked={compressed} onChange={(e) => setCompressed(e.target.checked)} /> compressed
          folders
        </label>
        <Tree roots={packages} compressed={compressed} defaultExpanded={allDirs} style={frame} aria-label="Packages" />
      </div>
    );
  },
};

// One deep, expanded branch with files at every level, so scrolling pushes
// ancestors off the top and the sticky overlay has something to pin.
const deepNames = ['app', 'features', 'editor', 'plugins', 'markdown', 'render'];
const deepExpanded = deepNames.map((_, i) => deepNames.slice(0, i + 1).join('/'));
const deepBranch: TreeNode[] = (() => {
  const filesOf = (parent: string): TreeNode[] =>
    Array.from(
      {length: 8},
      (_, i) => ({id: `${parent}/file-${i}.ts`, name: `file-${i}.ts`, kind: 'file', ext: 'ts'}) as TreeNode,
    );
  let node: TreeNode | null = null;
  for (let i = deepNames.length - 1; i >= 0; i--) {
    const path = deepExpanded[i];
    node = {id: path, name: deepNames[i], kind: 'dir', children: node ? [node, ...filesOf(path)] : filesOf(path)};
  }
  return [node as TreeNode];
})();

/**
 * Sticky ancestors (VS Code "sticky scroll"): scroll down into the deep branch and
 * the parent folders pin, stacked, at the top so you keep your path context. The
 * stack is capped (deepest kept); pinned rows stay interactive (click, collapse).
 */
export const StickyAncestors: StoryObj = {
  render: () => (
    <Tree
      roots={deepBranch}
      stickyAncestors
      defaultExpanded={deepExpanded}
      height={340}
      style={frame}
      aria-label="Deep"
    />
  ),
};
