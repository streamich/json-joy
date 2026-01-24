import type {Meta, StoryObj} from '@storybook/react';
import {Highlight as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Highlight',
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
    text: 'this is some text, this text can have highlights',
    query: ['text', 'have'],
  },
};
