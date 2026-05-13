import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BlobFace as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/BlobFace',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {control: {type: 'range', min: 16, max: 96, step: 2}},
    title: {control: 'text'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    size: 40,
    title: 'BlobFace',
  },
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
      {[20, 28, 36, 48, 64].map((size) => (
        <Component key={size} size={size} title={`BlobFace ${size}`} />
      ))}
    </div>
  ),
};

export const InTextFlow: StoryObj<typeof meta> = {
  render: () => (
    <div style={{fontSize: 18, lineHeight: 1.6, maxWidth: 420}}>
      The status mascot <Component size={28} title="BlobFace mascot" style={{margin: '0 6px -4px'}} /> watches the pointer,
      blinks sometimes, and gets very pleased when hovered.
    </div>
  ),
};

export const Crowd: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', padding: 12}}>
      <Component size={24} title="BlobFace 1" />
      <Component size={32} title="BlobFace 2" />
      <Component size={40} title="BlobFace 3" />
      <Component size={52} title="BlobFace 4" />
    </div>
  ),
};