import type {Meta, StoryObj} from '@storybook/react';
import {SpinnerBars as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/SpinnerBars',
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
