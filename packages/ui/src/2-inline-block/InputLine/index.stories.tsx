import type {Meta, StoryObj} from '@storybook/react';
import {InputLine as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputLine',
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
    value: '...',
  },
};
