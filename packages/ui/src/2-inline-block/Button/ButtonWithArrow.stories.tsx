import type {Meta, StoryObj} from '@storybook/react';
import {ButtonWithArrow as Component} from './ButtonWithArrow';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Button/ButtonWithArrow',
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
    children: 'Click me',
  },
};
