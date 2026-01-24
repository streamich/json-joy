import type {Meta, StoryObj} from '@storybook/react';
import Component from './More';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/More',
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
