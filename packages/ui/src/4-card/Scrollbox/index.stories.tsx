import * as React from 'react';
import {Scrollbox as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '4. Card/Scrollbox',
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
    style: {
      width: 200,
      height: 200,
      background: '#eee',
    },
    children: <div style={{padding: 32, width: 144, height: 400}}>scroll me ...</div>,
  },
};
