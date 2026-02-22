import type {Meta, StoryObj} from '@storybook/react';
import {Code as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Code',
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
    children: 'console.log(123)',
  },
};
