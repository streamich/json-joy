import type {Meta, StoryObj} from '@storybook/react';
import {EmojiInline as Component} from './index';

const meta: Meta<typeof Component> = {
  title: 'Markdown/<EmojiInline>',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    source: 'smile',
  },
};
