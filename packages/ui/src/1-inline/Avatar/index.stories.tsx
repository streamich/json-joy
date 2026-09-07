import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Avatar as Component, shapes} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Avatar',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {control: {type: 'range', min: -4, max: 5, step: 1}},
    width: {control: {type: 'number'}},
    name: {control: 'text'},
    src: {control: 'text'},
    emoji: {control: 'text'},
    color: {control: 'color'},
    href: {control: 'text'},
    letters: {control: {type: 'number'}},
    grey: {control: 'boolean'},
    lightGrey: {control: 'boolean'},
    transparent: {control: 'boolean'},
    square: {control: 'boolean'},
    rounded: {control: 'boolean'},
    isPrivate: {control: 'boolean'},
    isOP: {control: 'boolean'},
    hover: {control: 'boolean'},
    bold: {control: 'boolean'},
    del: {control: 'boolean'},
    fluid: {control: 'boolean'},
    fill: {control: 'boolean'},
    ring: {control: 'boolean'},
    glow: {control: 'boolean'},
    shape: {control: {type: 'range', min: 0, max: shapes.length - 1, step: 1}},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Self-contained portraits so image stories render without a network. */
const portrait = (bg: string, accent = '#fff') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">' +
      `<rect width="128" height="128" fill="${bg}"/>` +
      `<circle cx="64" cy="50" r="24" fill="${accent}"/>` +
      `<rect x="28" y="80" width="72" height="52" rx="26" fill="${accent}"/>` +
      '</svg>',
  );

const purplePortrait = portrait('#6c5ce7');
const tealPortrait = portrait('#00b894');
const orangePortrait = portrait('#e17055');

const Row: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 16}) => (
  <div style={{display: 'flex', gap, alignItems: 'center', flexWrap: 'wrap'}}>{children}</div>
);

/** A labelled, bordered box used to demonstrate the fluid (no-size) avatar. */
const Box: React.FC<{w: number; h: number; label: string; children: React.ReactNode}> = ({w, h, label, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start'}}>
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        border: '2px dashed #c9c9d4',
        borderRadius: 8,
        padding: 4,
        background: '#f4f4f8',
      }}
    >
      {children}
    </div>
    <span style={{font: '11px/1 ui-monospace, monospace', color: '#8a8a96'}}>{label}</span>
  </div>
);

export const Primary: Story = {
  args: {
    name: 'Ada Lovelace',
  },
};

export const Image: Story = {
  args: {
    size: 2,
    src: purplePortrait,
    name: 'Ada Lovelace',
  },
};

export const Initials: Story = {
  render: () => (
    <Row>
      <Component size={2} name="Ada Lovelace" />
      <Component size={2} name="Grace Hopper" />
      <Component size={2} name="Alan Turing" />
      <Component size={2} name="Katherine Johnson" />
      <Component size={2} name="Linus" letters={1} />
    </Row>
  ),
};

export const Emoji: Story = {
  render: () => (
    <Row>
      <Component size={2} emoji="😀" />
      <Component size={2} emoji="🚀" />
      <Component size={2} emoji="🐙" />
      <Component size={2} emoji="🎩" />
    </Row>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Row>
      {([-2, -1, 0, 1, 2, 3] as const).map((size) => (
        <Component key={size} size={size} src={tealPortrait} name="Grace Hopper" />
      ))}
    </Row>
  ),
};

export const Widths: Story = {
  render: () => (
    <Row>
      {[16, 24, 32, 48, 64, 96].map((width) => (
        <Component key={width} width={width} name="Grace Hopper" />
      ))}
    </Row>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Row gap={24}>
      <Component size={2} src={orangePortrait} />
      <Component size={2} src={orangePortrait} rounded />
      <Component size={2} src={orangePortrait} square />
      <Component size={2} src={orangePortrait} shape={1} />
      <Component size={2} src={orangePortrait} shape={0} />
      <Component size={2} emoji="🐙" />
    </Row>
  ),
};

export const Colors: Story = {
  render: () => (
    <Row>
      <Component size={2} name="Default Hash" />
      <Component size={2} name="Custom" color="#a855f7" />
      <Component size={2} name="Grey" grey />
      <Component size={2} name="Light Grey" lightGrey />
      <Component size={2} emoji="🌈" transparent />
    </Row>
  ),
};

export const Badges: Story = {
  render: () => (
    <Row gap={24}>
      <Component size={3} src={purplePortrait} isPrivate />
      <Component size={3} src={purplePortrait} isOP />
      <Component size={3} src={purplePortrait} badge />
      <Component size={3} src={purplePortrait} bottomRight={<Component width={22} emoji="✅" />} />
    </Row>
  ),
};

export const States: Story = {
  render: () => (
    <Row gap={24}>
      <Component size={2} src={tealPortrait} hover />
      <Component size={2} name="Deleted" del />
      <Component size={2} name="Bold Initials" bold />
      <Component size={2} name="Broken Image" src="https://invalid.example/missing.png" />
    </Row>
  ),
};

/**
 * `fill` paints a faint background shade behind the content — handy with
 * `emoji`, which is otherwise transparent, so the circle/square shape reads.
 */
export const Fill: Story = {
  render: () => (
    <Row gap={24}>
      <Component size={2} emoji="🐙" />
      <Component size={2} emoji="🐙" fill />
      <Component size={2} emoji="🚀" fill square />
      <Component size={2} emoji="🎩" fill shape={0} />
    </Row>
  ),
};

/** `ring` draws a colored status ring (accent by default, or any CSS color). */
export const Ring: Story = {
  render: () => (
    <Row gap={24}>
      <Component size={2} src={purplePortrait} ring />
      <Component size={2} src={tealPortrait} ring="#e91e63" />
      <Component size={2} name="On" ring="#22c55e" />
      <Component size={2} emoji="🐙" fill ring="#f59e0b" square />
    </Row>
  ),
};

/** `glow` adds a soft colored halo (accent by default, or any CSS color). */
export const Glow: Story = {
  render: () => (
    <Row gap={32}>
      <Component size={3} src={purplePortrait} glow />
      <Component size={3} src={tealPortrait} glow="#06b6d4" />
      <Component size={3} name="AI" glow="#a855f7" color="#a855f7" />
      <Component size={3} src={orangePortrait} ring="#fff" glow="#e17055" />
    </Row>
  ),
};

/**
 * `shape` selects an irregular/organic outline by index from the exported
 * `shapes` list (blobs and squircle-like forms). Combines with `ring`.
 */
export const Shape: Story = {
  render: () => (
    <Row gap={24}>
      {shapes.map((_, shape) => (
        <div key={shape} style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center'}}>
          <Component size={3} src={purplePortrait} shape={shape} />
          <span style={{font: '11px/1 ui-monospace, monospace', color: '#8a8a96'}}>shape={shape}</span>
        </div>
      ))}
    </Row>
  ),
};

export const Link: Story = {
  args: {
    size: 2,
    src: purplePortrait,
    name: 'Ada Lovelace',
    href: 'https://example.com',
    hover: true,
  },
};

/**
 * Opt in with `fluid` and no `size`/`width`: the avatar stretches to fill its
 * parent while remaining a square (width === height). In a non-square container
 * it becomes the largest square that fits, anchored top-left.
 */
export const Fluid: Story = {
  render: () => (
    <Row gap={24}>
      <Box w={96} h={96} label="96 × 96 (square)">
        <Component fluid src={purplePortrait} name="Ada Lovelace" />
      </Box>
      <Box w={160} h={160} label="160 × 160 (square)">
        <Component fluid src={tealPortrait} name="Grace Hopper" />
      </Box>
      <Box w={240} h={120} label="240 × 120 (wide)">
        <Component fluid src={orangePortrait} name="Alan Turing" />
      </Box>
      <Box w={120} h={220} label="120 × 220 (tall)">
        <Component fluid name="Katherine Johnson" />
      </Box>
    </Row>
  ),
};

export const FluidContent: Story = {
  render: () => (
    <Row gap={24}>
      <Box w={140} h={140} label="image">
        <Component fluid src={purplePortrait} />
      </Box>
      <Box w={140} h={140} label="initials">
        <Component fluid name="Grace Hopper" />
      </Box>
      <Box w={140} h={140} label="emoji">
        <Component fluid emoji="🚀" />
      </Box>
      <Box w={140} h={140} label="square shape">
        <Component fluid src={tealPortrait} square />
      </Box>
    </Row>
  ),
};
