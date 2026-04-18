import * as React from 'react';
import Icon from 'iconista';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {FlipHorizontal as Component} from '.';

const meta: Meta<typeof Component> = {
  title: 'Icons/Interactive/FlipHorizontal',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {control: false},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Component>
        <Icon set="ibm_16" icon="trash-can" width={24} height={24} />
      </Component>
      <Component>
        <Icon set="ibm_16" icon="trash-can" width={16} height={16} />
      </Component>
      <Component>
        <Icon set="ibm_16" icon="trash-can" width={12} height={12} />
      </Component>
    </div>
  ),
};

export const ButtonMode: StoryObj<typeof meta> = {
  args: {
    onClick: () => {},
  },
  render: (args) => (
    <Component {...args}>
      <Icon set="ibm_16" icon="trash-can" width={24} height={24} />
    </Component>
  ),
};
