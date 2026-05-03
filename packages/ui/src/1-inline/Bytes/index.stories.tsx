import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Bytes as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Bytes',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {control: {type: 'number'}},
    binary: {control: 'boolean'},
    precision: {control: {type: 'number'}},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {value: 12_400},
};

export const Scale: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={0} />
      <Component value={42} />
      <Component value={1500} />
      <Component value={12_400} />
      <Component value={1_500_000} />
      <Component value={3_400_000_000} />
      <Component value={2_500_000_000_000} />
    </div>
  ),
};

export const Binary: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={1024} binary />
      <Component value={1024 * 1024} binary />
      <Component value={1.5 * 1024 * 1024 * 1024} binary />
    </div>
  ),
};

export const Precision: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={1_234_567} precision={0} />
      <Component value={1_234_567} precision={1} />
      <Component value={1_234_567} precision={2} />
      <Component value={1_234_567} precision={3} />
    </div>
  ),
};
