import type {Meta, StoryObj} from '@storybook/react';
import {EmptyState as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '4. Card/EmptyState',
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
    children: undefined,
  },
};

export const WithContents: StoryObj<typeof meta> = {
  args: {
    children: '...',
  },
};

export const WithIcon: StoryObj<typeof meta> = {
  args: {
    emoji: '👋',
  },
};

export const Frame: StoryObj<typeof meta> = {
  args: {
    frame: true,
  },
};
