import type {Meta, StoryObj} from '@storybook/react';
import {Facebook as Component} from './Facebook';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/Facebook',
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
