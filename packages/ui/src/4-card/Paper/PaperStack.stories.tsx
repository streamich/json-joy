import * as React from 'react';
import {PaperStack as Component} from './PaperStack';
import {Paper} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '4. Card/Paper/PaperStack',
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
    children: [
      <Paper key={1}>
        <div style={{padding: 32}}>Card 1</div>
      </Paper>,
      <Paper key={2}>
        <div style={{padding: 32}}>Card 2</div>
      </Paper>,
      <Paper key={3}>
        <div style={{padding: 32}}>Card 3</div>
      </Paper>,
    ],
  },
};
