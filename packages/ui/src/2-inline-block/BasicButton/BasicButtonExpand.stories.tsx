import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BasicButtonExpand as Component} from './BasicButtonExpand';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonExpand',
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

export const Tinted: StoryObj<typeof meta> = {
  args: {
    size: 40,
    rounder: true,
    color: '#2563eb',
  },
};
