import * as React from 'react';
import {Doodle, DoodleRect, DoodleBend} from './index';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Doodle> = {
  title: '5. Block/Doodle',
  component: Doodle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    preset: {control: 'inline-radio', options: [undefined, 'mini', 'arch']},
    dir: {control: 'inline-radio', options: ['horizontal', 'vertical', 'diagonal']},
    pattern: {control: 'inline-radio', options: ['wave', 'scallop']},
    variant: {control: 'inline-radio', options: ['line', 'small', 'blog']},
    segments: {control: {type: 'range', min: 1, max: 10, step: 1}},
    size: {control: {type: 'range', min: 24, max: 480, step: 4}},
    dimOpacity: {control: {type: 'range', min: 0, max: 1, step: 0.05}},
    dim: {control: 'boolean'},
    brightenOnHover: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {segments: 4, dir: 'horizontal'},
};

export const Directions: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 48, alignItems: 'flex-end'}}>
      <Doodle dir="horizontal" segments={4} />
      <Doodle dir="vertical" segments={4} size={70} />
      <Doodle dir="diagonal" segments={3} size={180} />
    </div>
  ),
};

export const Scallop: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start'}}>
      <Doodle pattern="scallop" segments={5} />
      <Doodle pattern="scallop" segments={5} dim />
      <Doodle pattern="scallop" segments={8} size={420} dim brightenOnHover />
      <small style={{opacity: 0.6}}>caps only, no rectangle stems &mdash; last one brightens on hover</small>
    </div>
  ),
};

export const SegmentCount: Story = {
  args: {
    size: 36,
  },

  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
      {[1, 2, 3, 5, 8].map((n) => (
        <Doodle key={n} segments={n} size={60 + n * 40} />
      ))}
    </div>
  ),
};

export const Dimmed: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Doodle segments={5} dim />
      <Doodle segments={5} dim dimOpacity={0.25} />
      <Doodle segments={5} dim brightenOnHover />
      <small style={{opacity: 0.6}}>last one brightens on hover</small>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start'}}>
      <Doodle variant="small" />
      <Doodle variant="line" />
      <Doodle variant="blog" />
    </div>
  ),
};

export const Presets: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 48, alignItems: 'flex-end'}}>
      <Doodle preset="mini" />
      <Doodle preset="arch" />
    </div>
  ),
};

export const PaperCorner: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 360,
        height: 220,
        borderRadius: 16,
        background: 'var(--colBgTint, #f3f4f6)',
        overflow: 'hidden',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <Doodle variant="small" dim dimOpacity={0.35} brightenOnHover style={{position: 'absolute', top: 0, right: 0}} />
      <p style={{margin: 0, opacity: 0.7}}>A doodle decorating the corner of a sheet of paper.</p>
    </div>
  ),
};

export const Tiles: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <DoodleRect size={40} color={5} />
      <DoodleBend size={40} orientation="tr" color={0} />
      <DoodleBend size={40} orientation="br" color={1} />
      <DoodleBend size={40} orientation="bl" color={2} />
      <DoodleBend size={40} orientation="tl" color={3} />
      <DoodleBend size={40} orientation="tr" dim />
    </div>
  ),
};
