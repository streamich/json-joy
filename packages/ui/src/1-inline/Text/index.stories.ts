import type {Meta, StoryObj} from '@storybook/react';

import {Text} from '.';

const meta: Meta<typeof Text> = {
  title: '1. Inline/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {control: 'text'},
    as: {control: 'select', options: ['p', 'span', 'div']},
    nowrap: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Hello World',
  },
};
