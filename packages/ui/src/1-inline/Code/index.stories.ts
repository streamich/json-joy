import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Code as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Code',
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
    children: 'console.log(123)',
  },
};

export const Border: StoryObj<typeof meta> = {
  args: {
    children: 'console.log(123)',
    border: true,
  },
};

export const Gray: StoryObj<typeof meta> = {
  args: {
    children: 'console.log(123)',
    gray: true,
  },
};

export const Outline: StoryObj<typeof meta> = {
  args: {
    children: 'console.log(123)',
    outline: true,
    noBg: true,
  },
};
