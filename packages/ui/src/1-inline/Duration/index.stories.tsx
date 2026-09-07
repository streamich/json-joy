import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Duration as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Duration',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    value: 4980000,
  },
};

export const Scale: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Component value={950} />
      <Component value={12000} />
      <Component value={298000} />
      <Component value={4980000} />
      <Component value={7200000} />
      <Component value={273600000} />
    </div>
  ),
};
