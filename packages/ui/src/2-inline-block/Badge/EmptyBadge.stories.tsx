import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {EmptyBadge as Component} from './EmptyBadge';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Badge/EmptyBadge',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    name: 'Mr Name',
  },
};

/** Without a `name` the label falls back to the empty-set symbol (∅). */
export const Default: Story = {
  args: {},
};

export const CustomName: Story = {
  args: {
    name: 'No assignee',
  },
};

export const Square: Story = {
  args: {
    name: 'No organization',
    square: true,
  },
};

export const Small: Story = {
  args: {
    name: 'Nothing here',
    size: 24,
  },
};

export const Large: Story = {
  args: {
    name: 'Nothing here',
    size: 64,
  },
};

export const SizeScale: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {[24, 32, 40, 48, 64].map((size) => (
        <Component key={size} size={size} name={`${size}px placeholder`} />
      ))}
    </div>
  ),
};
