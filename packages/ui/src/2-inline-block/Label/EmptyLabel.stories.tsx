import type {Meta, StoryObj} from '@storybook/react';
import {EmptyLabel as Component} from './EmptyLabel';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Label/EmptyLabel',
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
