import * as React from 'react';
import {ToastCardStack as Component} from '.';
import {ToastCard} from '../../4-card/ToastCard';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '5. Block/ToastCardStack',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const children = [
  <ToastCard key={0} title={'Message sent!'} onClose={() => {}} />,
  <ToastCard
    key={1}
    title={'Copied to clipboard'}
    message={'The code has been copied to your clipboard. Use Ctrl+V to paste it in your code editor.'}
    progress={0.66}
    onClose={() => {}}
  />,
  <ToastCard key={2} title={'Login successful!'} onClose={() => {}} />,
];

export const Primary: StoryObj<typeof meta> = {
  args: {
    children,
  },
};

export const Right: StoryObj<typeof meta> = {
  args: {
    children,
    right: true,
  },
};

export const BottomLeft: StoryObj<typeof meta> = {
  args: {
    children,
    bottom: true,
  },
};

export const BottomRight: StoryObj<typeof meta> = {
  args: {
    children,
    right: true,
    bottom: true,
  },
};
