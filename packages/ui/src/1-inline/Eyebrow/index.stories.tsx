import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Eyebrow as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Eyebrow',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'color'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {children: 'Project'},
};

/** Above a title, as a type/kind label. */
export const AboveTitle: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Component>Document</Component>
      <span style={{fontSize: 20, fontWeight: 600}}>Q3 Planning Notes</span>
    </div>
  ),
};

/** Custom colors for section accents. */
export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component>Default</Component>
      <Component color="#6c5ce7">Accent</Component>
      <Component color="#00b894">Success</Component>
      <Component color="#e17055">Warning</Component>
    </div>
  ),
};
