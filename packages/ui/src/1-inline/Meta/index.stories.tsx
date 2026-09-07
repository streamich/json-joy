import type {Meta as MetaObj, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Meta as Component} from '.';

const meta: MetaObj<typeof Component> = {
  title: '1. Inline/Meta',
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
    children: 'Empty',
  },
};

export const Caps: StoryObj<typeof meta> = {
  args: {
    caps: true,
    children: 'Yes',
  },
};

export const Implicit: StoryObj<typeof meta> = {
  args: {
    implicit: true,
    children: 'Auto',
  },
};

export const Warning: StoryObj<typeof meta> = {
  args: {
    tone: 'warning',
    children: '2 invalid',
  },
};

export const Voices: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', fontSize: 14}}>
      <div>
        Status: <Component>Empty</Component>
      </div>
      <div>
        Published: <Component caps>Yes</Component>
      </div>
      <div>
        Line height: <Component implicit>Auto</Component>
      </div>
      <div>
        Tags: <Component>+4</Component>
      </div>
      <div>
        Assignees: 3 <Component>selected</Component>
      </div>
      <div>
        Values: <Component tone="warning">2 invalid</Component>
      </div>
    </div>
  ),
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      {[12, 14, 18, 24].map((size) => (
        <div key={size} style={{fontSize: size}}>
          value <Component>Empty</Component>
        </div>
      ))}
    </div>
  ),
};
