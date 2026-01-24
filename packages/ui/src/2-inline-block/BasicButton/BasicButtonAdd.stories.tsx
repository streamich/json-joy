import type {Meta, StoryObj} from '@storybook/react';
import {BasicButtonAdd as Component} from './BasicButtonAdd';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonAdd',
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
