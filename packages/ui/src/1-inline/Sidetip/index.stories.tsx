import type {Meta, StoryObj} from '@storybook/react';
import {Sidetip as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Sidetip',
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
    children: 'Contents',
  },
};

export const Small: StoryObj<typeof meta> = {
  args: {
    children: 'Ctrl + C',
    small: true,
  },
};
