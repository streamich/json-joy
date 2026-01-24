// import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ToastCard as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '4. Card/ToastCard',
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
    title: 'Copied to clipboard!',
    message: 'The code has been copied to your clipboard. Use Ctrl+V to paste it in your code editor.',
    progress: 0.4,
    onClose: () => {},
  },
};

export const TitleOnly: StoryObj<typeof meta> = {
  args: {
    title: 'Copied to clipboard!',
    progress: 0.4,
    onClose: () => {},
  },
};

export const NoCloseHandler: StoryObj<typeof meta> = {
  args: {
    title: 'Copied to clipboard!',
    progress: 0.4,
  },
};
