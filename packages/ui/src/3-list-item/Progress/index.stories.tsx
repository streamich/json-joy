import * as React from 'react';
import {Progress as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Progress',
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
    value: 0.65,
  },
  decorators: [
    (Story: any) => (
      <div style={{width: '300px', height: 100, border: '1px solid #eee', overflow: 'hidden'}}>
        <Story />
      </div>
    ),
  ],
};
