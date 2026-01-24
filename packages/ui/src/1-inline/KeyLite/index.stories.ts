import type {Meta, StoryObj} from '@storybook/react';
import {KeyLite} from '.';

const meta: Meta<typeof KeyLite> = {
  title: '1. Inline/KeyLite',
  component: KeyLite,
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
