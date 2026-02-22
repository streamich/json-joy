import type {Meta, StoryObj} from '@storybook/react';
import {ModalAlert as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '7. Fullscreen/ModalAlert',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'Children ...',
  },
};
