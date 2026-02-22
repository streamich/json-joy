import * as React from 'react';
import {SeparatorColorful as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '3. List Item/SeparatorColorful',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
  decorators: [(Story) => <div style={{padding: 32, width: '100%', minWidth: 300}}>{Story()}</div>],
};
