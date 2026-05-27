import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CursorIcon as Component} from './CursorIcon';

const meta: Meta<typeof Component> = {
  title: 'Icons/SVG/CursorIcon',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'color'},
  },
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {},
};

export const BigSize: StoryObj<typeof meta> = {
  args: {width: 100},
};

export const CustomColor: StoryObj<typeof meta> = {
  args: {color: 'green'},
};
