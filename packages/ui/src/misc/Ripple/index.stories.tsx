import * as React from 'react';
import {Ripple as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: 'Miscellaneous/Ripple',
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
    children: (
      <div
        style={{
          width: 300,
          height: 200,
          lineHeight: '200px',
          textAlign: 'center',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, .1)',
        }}
      >
        foobar
      </div>
    ),
  },
};
