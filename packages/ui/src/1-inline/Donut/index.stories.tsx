import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Donut as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Donut',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    progress: {control: {type: 'range', min: 0, max: 1, step: 0.01}},
    cutout: {control: {type: 'range', min: 0, max: 1, step: 0.01}},
    size: {control: {type: 'range', min: 8, max: 256, step: 1}},
    color: {control: 'color'},
    trackColor: {control: 'color'},
    rounded: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    progress: 0.65,
    cutout: 0.6,
    size: 96,
    color: '#6c5ce7',
  },
};

/** `progress` sweeps the ring clockwise from the top. */
export const ProgressScale: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
      {[0, 0.25, 0.5, 0.75, 1].map((progress) => (
        <div key={progress} style={{textAlign: 'center'}}>
          <Component progress={progress} size={64} color="#6c5ce7" />
          <div style={{fontSize: 12, marginTop: 4}}>{Math.round(progress * 100)}%</div>
        </div>
      ))}
    </div>
  ),
};

/** `cutout` morphs the shape: `0` is a solid disk (pie), `1` is an invisible ring. */
export const CutoutScale: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
      {[0, 0.25, 0.5, 0.75, 1].map((cutout) => (
        <div key={cutout} style={{textAlign: 'center'}}>
          <Component progress={0.7} cutout={cutout} size={64} color="#0984e3" />
          <div style={{fontSize: 12, marginTop: 4}}>cutout {cutout}</div>
        </div>
      ))}
    </div>
  ),
};

/** `cutout={0}` renders a pie chart instead of a ring. */
export const Pie: Story = {
  args: {
    progress: 0.35,
    cutout: 0,
    size: 96,
    color: '#00b894',
  },
};

/** Any CSS color; the track defaults to a subtle neutral. */
export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
      {['#e17055', '#0984e3', '#00b894', '#6c5ce7', '#fdcb6e'].map((color) => (
        <Component key={color} progress={0.6} size={56} color={color} />
      ))}
    </div>
  ),
};

/** Rounded arc ends. */
export const Rounded: Story = {
  args: {
    progress: 0.6,
    cutout: 0.7,
    size: 96,
    color: '#e17055',
    trackColor: '#e1705522',
    rounded: true,
  },
};

/** Hide the track with `trackColor="none"`. */
export const NoTrack: Story = {
  args: {
    progress: 0.45,
    cutout: 0.6,
    size: 96,
    color: '#0984e3',
    trackColor: 'none',
    rounded: true,
  },
};

/** Scales cleanly at any size — `currentColor` is inherited from the parent. */
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', color: '#6c5ce7'}}>
      {[16, 24, 32, 48, 96].map((size) => (
        <Component key={size} progress={0.7} size={size} />
      ))}
    </div>
  ),
};
