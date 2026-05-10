import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Pill as Component} from '.';
import {Dot} from '../Dot';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Pill',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'text'},
    solid: {control: 'boolean'},
    small: {control: 'boolean'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {children: 'Active'},
};

export const Colors: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <Component color="neutral">Neutral</Component>
      <Component color="success">Positive</Component>
      <Component color="error">Negative</Component>
      <Component color="warning">Warning</Component>
      <Component color="link">Blue</Component>
      <Component color="accent">Accent</Component>
      <Component color="#a855f7">Custom</Component>
    </div>
  ),
};

export const Solid: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <Component solid color="neutral">
        Neutral
      </Component>
      <Component solid color="success">
        Positive
      </Component>
      <Component solid color="error">
        Negative
      </Component>
      <Component solid color="warning">
        Warning
      </Component>
      <Component solid color="link">
        Blue
      </Component>
      <Component solid color="accent">
        Accent
      </Component>
    </div>
  ),
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <Component small color="success">
        Small
      </Component>
      <Component color="success">Default</Component>
    </div>
  ),
};

export const WithDot: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <Component color="success">
        <Dot color="success" />
        Active
      </Component>
      <Component color="warning">
        <Dot color="warning" />
        Pending
      </Component>
      <Component color="error">
        <Dot color="error" />
        Failed
      </Component>
      <Component color="neutral">
        <Dot color="neutral" />
        Idle
      </Component>
    </div>
  ),
};
