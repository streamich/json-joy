import * as React from 'react';
import {Split as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Split',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  render: () => {
    return (
      <Component>
        <div>left</div>
        <div>right</div>
      </Component>
    );
  },
};

export const VerticalAlign: StoryObj<typeof meta> = {
  render: () => {
    return (
      <Component style={{alignItems: 'center'}}>
        <div>left line 1</div>
        <div>
          <div>right line 1</div>
          <div>right line 2</div>
        </div>
      </Component>
    );
  },
};
