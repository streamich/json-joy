import type {Meta, StoryObj} from '@storybook/react';
import {Tiles as Component} from '.';

const meta: Meta<typeof Component> = {
  title: 'Icons/Interactive/Tiles',
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
