import type {Meta, StoryObj} from '@storybook/react';
import {SpinnerCircle as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/SpinnerCircle',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
};
