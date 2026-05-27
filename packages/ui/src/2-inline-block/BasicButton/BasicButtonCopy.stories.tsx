import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BasicButtonCopy as Component} from './BasicButtonCopy';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonCopy',
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
    onCopy: () => 'Hello, world!',
    tooltip: 'Copy as Markdown',
  },
};
