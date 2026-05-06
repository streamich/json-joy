import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Hint as Component} from '.';
import {KeyLite} from '../KeyLite';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Hint',
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
    children: 'Heading 1',
  },
};

export const WithKey: StoryObj<typeof meta> = {
  render: () => (
    <Component>
      Heading 1 <KeyLite>Esc</KeyLite>
    </Component>
  ),
};

export const WithUndoKey: StoryObj<typeof meta> = {
  render: () => (
    <Component>
      Bold <KeyLite>⌫</KeyLite>
    </Component>
  ),
};
