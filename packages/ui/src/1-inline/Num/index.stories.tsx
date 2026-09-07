import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Num as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Num',
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
    value: 1234567,
  },
};

export const WithUnit: StoryObj<typeof meta> = {
  args: {
    value: 1280,
    unit: 'px',
  },
};

export const Precision: StoryObj<typeof meta> = {
  args: {
    value: 1234.5678,
    precision: 2,
  },
};

export const Values: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end'}}>
      <Component value={0} />
      <Component value={42} />
      <Component value={-1234} />
      <Component value={1234567.891} />
      <Component value={98.6} unit="kg" />
      <Component value={120000} unit="ms" />
      <Component value={0.15} precision={2} />
      <Component value={1e21} />
    </div>
  ),
};
