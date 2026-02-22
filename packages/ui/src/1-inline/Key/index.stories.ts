import type {Meta, StoryObj} from '@storybook/react';
import {Key as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Key',
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
    children: 'Ctrl',
  },
};
