import type {Meta, StoryObj} from '@storybook/react';
import {CharIcon as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/CharIcon',
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
    children: 'AB',
  },
};
