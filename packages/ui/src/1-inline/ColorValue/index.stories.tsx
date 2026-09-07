import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {ColorValue as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/ColorValue',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    color: '#0077ff',
  },
};

export const WithAlpha: StoryObj<typeof meta> = {
  args: {
    color: '#0077ff80',
  },
};

export const Large: StoryObj<typeof meta> = {
  args: {
    color: '#0077ff',
    size: 20,
  },
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      {[12, 14, 18, 24].map((size) => (
        <Component key={size} color="#0077ff" size={size} />
      ))}
    </div>
  ),
};

export const Swatches: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      {['#ff3b30', '#34c759', '#0077ff', 'rgb(255, 149, 0)', '#00000080', 'not-a-color'].map((color) => (
        <Component key={color} color={color} />
      ))}
    </div>
  ),
};
