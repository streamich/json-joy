import type {Meta, StoryObj} from '@storybook/react';
import Component from './Github';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/Github',
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
