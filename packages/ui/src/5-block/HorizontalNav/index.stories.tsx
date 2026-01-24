import type {Meta, StoryObj} from '@storybook/react';
import {HorizontalNav} from '.';

const meta: Meta<typeof HorizontalNav> = {
  title: '5. Block/HorizontalNav',
  component: HorizontalNav,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    items: [
      {node: 'Home', to: '/'},
      {node: 'About', to: '/about'},
      {node: 'Contact', to: '/contact'},
    ],
  },
};

export const Selected: StoryObj<typeof meta> = {
  args: {
    items: [
      {node: 'Home', to: '/', active: true},
      {node: 'About', to: '/about'},
      {node: 'Contact', to: '/contact'},
    ],
  },
};
