import type {Meta, StoryObj} from '@storybook/react';
import {BasicButtonClose as Component} from './BasicButtonClose';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButton/BasicButtonClose',
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
