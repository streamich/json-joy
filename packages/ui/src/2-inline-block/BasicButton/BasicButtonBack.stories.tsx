import type {Meta, StoryObj} from '@storybook/react';
import {BasicButtonBack} from './BasicButtonBack';

const meta: Meta<typeof BasicButtonBack> = {
  title: '2. Inline Block/BasicButton/BasicButtonBack',
  component: BasicButtonBack,
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
