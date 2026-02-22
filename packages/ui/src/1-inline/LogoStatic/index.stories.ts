import type {Meta, StoryObj} from '@storybook/react';
import {LogoStatic as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/LogoStatic',
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
