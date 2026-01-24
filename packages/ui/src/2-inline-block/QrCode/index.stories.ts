import type {Meta, StoryObj} from '@storybook/react';
import Component from './QrCode';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/QrCode',
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
    data: 'https://example.com',
    style: {display: 'inline-block', width: '300px', height: '300px'},
  },
};
