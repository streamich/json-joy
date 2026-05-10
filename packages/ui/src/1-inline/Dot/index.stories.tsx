import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Dot as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Dot',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'text'},
    size: {control: {type: 'number'}},
    glow: {control: 'boolean'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {color: 'positive'},
};

export const Colors: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component color="neutral" />
      <Component color="success" />
      <Component color="error" />
      <Component color="warning" />
      <Component color="link" />
      <Component color="accent" />
      <Component color="#a855f7" />
    </div>
  ),
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component color="success" size={6} />
      <Component color="success" size={8} />
      <Component color="success" size={12} />
      <Component color="success" size={16} />
    </div>
  ),
};

export const Glow: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Component color="success" glow />
      <Component color="error" glow />
      <Component color="warning" glow />
    </div>
  ),
};
