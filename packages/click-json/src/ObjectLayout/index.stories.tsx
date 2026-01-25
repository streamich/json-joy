import type {Meta, StoryObj} from '@storybook/react';
import {ObjectLayout as Component} from '.';

const meta: Meta<typeof Text> = {
  title: 'ObjectLayout',
  component: Component as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'asdf',
    collapsedChildren: '25',
  } as any,
};
