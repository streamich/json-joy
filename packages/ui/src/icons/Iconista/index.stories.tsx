import type {Meta, StoryObj} from '@storybook/react';
import {Iconista as Component} from '.';

const meta: Meta<typeof Component> = {
  title: 'Icons/Iconista',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof Component> = {
  args: {
    set: 'atlaskit',
    icon: 'code',
    width: 32,
    height: 32,
  },
};
