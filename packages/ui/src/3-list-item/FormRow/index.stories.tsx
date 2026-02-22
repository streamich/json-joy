import * as React from 'react';
import {FormRow as Component} from '.';
import Paper from '../../4-card/Paper';
import {InputLine} from '../../2-inline-block/InputLine';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '3. List Item/FormRow',
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
    children: <InputLine />,
    title: 'Name',
    description: 'Please enter your name',
  },
  decorators: [
    (Story: any) => (
      <Paper style={{padding: 16, width: 300}}>
        <Story />
      </Paper>
    ),
  ],
};
