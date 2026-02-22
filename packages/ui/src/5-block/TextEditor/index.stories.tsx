import type {Meta, StoryObj} from '@storybook/react';
import {TextEditor as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '5. Block/TextEditor',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
};
