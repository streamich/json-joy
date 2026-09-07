import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {ColorPreview as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/ColorPreview',
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
    size: 22,
  },
};

export const WithAlpha: StoryObj<typeof meta> = {
  args: {
    color: '#0077ff80',
    checkerboard: true,
    size: 22,
  },
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      {[14, 20, 26, 36].map((size) => (
        <Component key={size} color="#0077ff" size={size} />
      ))}
    </div>
  ),
};
