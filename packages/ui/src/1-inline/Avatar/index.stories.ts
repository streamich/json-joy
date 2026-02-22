import type {Meta, StoryObj} from '@storybook/react';
import {Avatar as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Avatar',
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
