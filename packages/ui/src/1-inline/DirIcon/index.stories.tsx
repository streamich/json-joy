import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {DirIcon} from '.';

const meta: Meta<typeof DirIcon> = {
  title: '1. Inline/DirIcon',
  component: DirIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'color'},
    accent: {control: 'boolean'},
    gradient: {control: 'boolean'},
    open: {control: 'boolean'},
    files: {control: 'boolean'},
    link: {control: 'boolean'},
    count: {control: {type: 'number', min: 0, max: 200, step: 1}},
    variant: {control: 'inline-radio', options: ['auto', 'rich', 'flat']},
    size: {control: {type: 'range', min: 16, max: 128, step: 4}},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: 64,
    gradient: true,
    files: true,
  },
};

export const Closed: Story = {
  args: {size: 64, gradient: true},
};

export const Open: Story = {
  args: {size: 64, gradient: true, open: true, files: true},
};

export const Empty: Story = {
  args: {size: 64, gradient: true, files: false},
};

export const WithAccent: Story = {
  args: {size: 64, gradient: true, files: true, accent: true},
};

export const CustomColor: Story = {
  args: {size: 64, gradient: true, files: true, color: 'hsl(205 80% 56%)'},
};

export const Linked: Story = {
  args: {size: 80, gradient: true, files: true, link: true},
};

export const Counted: Story = {
  args: {size: 80, gradient: true, files: true, count: 42},
};

const Cell: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 96}}>
    <div style={{height: 72, display: 'flex', alignItems: 'flex-end'}}>{children}</div>
    <span style={{fontSize: 10, color: '#999', fontFamily: 'monospace', textAlign: 'center'}}>{label}</span>
  </div>
);

export const States: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', maxWidth: 640}}>
      <Cell label="empty">
        <DirIcon size={64} gradient />
      </Cell>
      <Cell label="files">
        <DirIcon size={64} gradient files />
      </Cell>
      <Cell label="open + empty">
        <DirIcon size={64} gradient open />
      </Cell>
      <Cell label="open + files">
        <DirIcon size={64} gradient open files />
      </Cell>
      <Cell label="accent">
        <DirIcon size={64} gradient files accent />
      </Cell>
      <Cell label="linked">
        <DirIcon size={64} gradient files link />
      </Cell>
      <Cell label="count">
        <DirIcon size={64} gradient files count={8} />
      </Cell>
      <Cell label="count 99+">
        <DirIcon size={64} gradient files count={128} />
      </Cell>
    </div>
  ),
};

const PALETTE = [
  ['yellow', undefined],
  ['blue', 'hsl(205 80% 56%)'],
  ['green', 'hsl(140 55% 50%)'],
  ['red', 'hsl(2 75% 60%)'],
  ['purple', 'hsl(270 55% 62%)'],
  ['teal', 'hsl(180 55% 48%)'],
  ['gray', 'hsl(220 8% 62%)'],
  ['pink', 'hsl(330 75% 66%)'],
] as const;

export const ColorCoded: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', maxWidth: 640}}>
      {PALETTE.map(([name, c]) => (
        <Cell key={name} label={name}>
          <DirIcon size={64} gradient files color={c} />
        </Cell>
      ))}
    </div>
  ),
};

export const FlatVsRich: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 32, alignItems: 'flex-start'}}>
      {(['flat', 'rich'] as const).map((variant) => (
        <div key={variant} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
          <strong style={{fontSize: 11, fontFamily: 'monospace', color: '#888'}}>{variant}</strong>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 12}}>
            <DirIcon size={48} variant={variant} gradient files />
            <DirIcon size={48} variant={variant} gradient files open />
            <DirIcon size={48} variant={variant} gradient />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
        {[16, 20, 24, 32, 40, 48, 64, 80, 96, 128].map((s) => (
          <DirIcon key={s} size={s} gradient files />
        ))}
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
        {[16, 20, 24, 32, 40, 48, 64, 80, 96, 128].map((s) => (
          <DirIcon key={s} size={s} gradient open files />
        ))}
      </div>
    </div>
  ),
};

/** How it reads as a tree row — small icons, tight rows. */
export const TreeRows: Story = {
  render: () => {
    const Row: React.FC<{depth: number; icon: React.ReactNode; name: string}> = ({depth, icon, name}) => (
      <div style={{display: 'flex', alignItems: 'center', gap: 6, paddingLeft: depth * 18, height: 22}}>
        {icon}
        <span style={{fontSize: 13, fontFamily: 'system-ui, sans-serif'}}>{name}</span>
      </div>
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', width: 240}}>
        <Row depth={0} icon={<DirIcon size={16} open files />} name="src" />
        <Row depth={1} icon={<DirIcon size={16} files />} name="components" />
        <Row depth={1} icon={<DirIcon size={16} />} name="empty" />
        <Row depth={1} icon={<DirIcon size={16} files color="hsl(205 80% 56%)" />} name="assets" />
        <Row depth={0} icon={<DirIcon size={16} files link />} name="node_modules" />
      </div>
    );
  },
};
