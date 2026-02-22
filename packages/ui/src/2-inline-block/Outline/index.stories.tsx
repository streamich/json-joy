import type {Meta, StoryObj} from '@storybook/react';
import {Outline as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Outline',
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
    label: 'Label',
    children: 'Children',
  },
};
