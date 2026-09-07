import type {Meta, StoryObj} from '@storybook/react-webpack5';
import type {icons_lucide} from 'iconista/lib/types';
import * as React from 'react';
import {Iconista} from '../../icons/Iconista';
import {Tree} from './Tree';
import type {TreeNode} from './types';

const meta: Meta = {
  title: '5. Block/Tree/Layers',
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

// A Figma-style layer panel: the same Tree, rendering a design document instead
// of files. Demonstrates per-node `icon()`, render slots (right-side controls),
// custom selection highlight, generous spacing, and no connector lines (Figma
// uses indentation alone).

const GREY = '#7a7a85';
const PURPLE = '#9333ea';

// Layer-type icons from the Lucide set, rendered through `<Iconista>` at the 16px
// row icon size. Components are tinted purple; the rest grey.
const layerIcon =
  (name: icons_lucide, color: string = GREY) =>
  (props?: React.SVGProps<SVGSVGElement>) => (
    <Iconista set="lucide" icon={name} width={16} height={16} color={color} {...props} />
  );

type LayerType = 'layout' | 'frame' | 'text' | 'image' | 'component';

const ICON: Record<LayerType, (props?: React.SVGProps<SVGSVGElement>) => React.ReactNode> = {
  layout: layerIcon('columns-2'),
  frame: layerIcon('frame'),
  text: layerIcon('type'),
  image: layerIcon('image'),
  component: layerIcon('component', PURPLE),
};

/** Build a layer node: type picks the icon; components get a purple name tint. */
const layer = (id: string, name: string, type: LayerType, children?: TreeNode[]): TreeNode => ({
  id,
  name,
  icon: ICON[type],
  children,
  ...(type === 'component' ? {decorations: [{tint: PURPLE}]} : {}),
});

const layers: TreeNode[] = [
  layer('paper', 'Paper', 'layout', [
    layer('paper/header', 'Header container', 'layout', [
      layer('paper/header/avatar', 'Avatar', 'frame', [layer('paper/header/avatar/photo', 'Photo', 'image')]),
      layer('paper/header/title', 'Header Title', 'text'),
      layer('paper/header/caption', 'Header Caption', 'text'),
      layer('paper/header/button', 'Action Button', 'frame'),
    ]),
    layer('paper/image', 'Image', 'image'),
    layer('paper/content', 'Content', 'frame', [layer('paper/content/text', 'Text Content', 'text')]),
    layer('paper/bar', 'Action Bar', 'layout', [
      layer('paper/bar/icon1', 'Icon Button', 'component'),
      layer('paper/bar/icon2', 'Icon Button', 'component'),
    ]),
  ]),
];

// ── Right-side controls (visibility + lock) ──────────────────────────────────

const ctrlBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  padding: 0,
  border: 'none',
  background: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

const ctrl = (icon: icons_lucide, color: string) => (
  <Iconista set="lucide" icon={icon} width={16} height={16} color={color} />
);

const frameStyle: React.CSSProperties = {
  width: 320,
  border: '1px solid rgba(0,0,0,0.12)',
  padding: 4,
  borderRadius: 8,
  overflow: 'hidden',
};

const without = (set: Set<string>, id: string): Set<string> => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

/**
 * A Figma-like layer tree: per-type layer icons via `node.icon()`, tall rows with
 * no connector lines, a purple selection that tints the selected container's
 * subtree, purple component-instance names, an always-visible lock, and a
 * visibility toggle that appears on row hover (or stays when a layer is hidden).
 */
export const FigmaLayers: StoryObj = {
  render: () => {
    const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set(['paper/header']));
    const [hidden, setHidden] = React.useState<Set<string>>(new Set());
    const [locked, setLocked] = React.useState<Set<string>>(new Set(['paper/bar/icon2']));
    return (
      <Tree
        roots={layers}
        lines="none"
        rowHeight={30}
        indent={20}
        height={420}
        selection="single"
        selected={selected}
        onSelectionChange={setSelected}
        defaultExpanded={['paper', 'paper/header', 'paper/content', 'paper/bar']}
        aria-label="Layers"
        style={frameStyle}
        renderName={(node) => <span style={{opacity: hidden.has(node.id) ? 0.45 : undefined}}>{node.name}</span>}
        renderRowBackground={(row, flags) => {
          if (flags.selected) return 'rgba(124,58,237,0.18)';
          for (const id of selected) if (row.node.id.startsWith(`${id}/`)) return 'rgba(124,58,237,0.06)';
          return undefined;
        }}
        renderDecorations={(node) => {
          const isHidden = hidden.has(node.id);
          const isLocked = locked.has(node.id);
          return (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 2}}>
              <button
                type="button"
                // `tree-actions` hides it until row hover; a hidden layer keeps it shown.
                className={isHidden ? '' : 'tree-actions'}
                style={ctrlBtn}
                title={isHidden ? 'Show' : 'Hide'}
                onClick={(e) => {
                  e.stopPropagation();
                  setHidden(without(hidden, node.id));
                }}
              >
                {isHidden ? ctrl('eye-off', '#3a3a44') : ctrl('eye', '#8a8a95')}
              </button>
              <button
                type="button"
                style={ctrlBtn}
                title={isLocked ? 'Unlock' : 'Lock'}
                onClick={(e) => {
                  e.stopPropagation();
                  setLocked(without(locked, node.id));
                }}
              >
                {ctrl(isLocked ? 'lock' : 'lock-open', isLocked ? '#3a3a44' : '#bdbdc7')}
              </button>
            </span>
          );
        }}
      />
    );
  },
};
