import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BasicButtonDelete as Component} from './BasicButtonDelete';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonDelete',
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

export const WithConfirm: StoryObj<typeof meta> = {
  args: {
    onConfirm: () => alert('Deleted!'),
  },
};
