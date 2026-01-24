import type {Meta, StoryObj} from '@storybook/react';
import {HeaderFooter as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '4. Card/HeaderFooter',
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
    children: 'content',
    header: 'header',
    footer: 'footer',
  },
};
