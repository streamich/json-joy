import * as React from 'react';
import {Fade as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '4. Card/Fade',
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
    height: 150,
    children: (
      <div style={{padding: 16}}>
        <p>This is the first line of content.</p>
        <p>This is the second line of content.</p>
        <p>This is the third line of content.</p>
        <p>This is the fourth line of content.</p>
        <p>This is the fifth line of content.</p>
        <p>This is the sixth line of content.</p>
        <p>This is the seventh line of content.</p>
        <p>This is the eighth line of content.</p>
      </div>
    ),
  },
};

export const TallFade: StoryObj<typeof meta> = {
  args: {
    height: 200,
    children: (
      <div style={{padding: 16}}>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>
        <p>Excepteur sint occaecat cupidatat non proident.</p>
        <p>Sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>Curabitur pretium tincidunt lacus.</p>
        <p>Nulla gravida orci a odio.</p>
        <p>Nullam varius, turpis et commodo pharetra.</p>
        <p>Est eros bibendum elit, nec luctus magna felis sollicitudin mauris.</p>
      </div>
    ),
  },
};
