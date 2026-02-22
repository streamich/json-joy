import type {Meta, StoryObj} from '@storybook/react';
import {BasicButtonMore as Component} from './BasicButtonMore';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonMore',
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
