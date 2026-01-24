import type {Meta, StoryObj} from '@storybook/react';
import {AvatarLabel as Component} from './AvatarLabel';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Label/AvatarLabel',
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
    name: 'Mr Name',
  },
};
