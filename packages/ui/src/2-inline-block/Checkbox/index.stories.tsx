import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Checkbox as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Checkbox',
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
    on: false,
  },
};

export const On: StoryObj<typeof meta> = {
  args: {
    on: true,
  },
};

export const Undecided: StoryObj<typeof meta> = {
  args: {
    on: null,
  },
};

export const SmallUndecided: StoryObj<typeof meta> = {
  args: {
    on: null,
    small: true,
  },
};

export const SmallOn: StoryObj<typeof meta> = {
  args: {
    on: true,
    small: true,
  },
};
export const SmallOff: StoryObj<typeof meta> = {
  args: {
    on: false,
    small: true,
  },
};
