// import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {PillButton as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/PillButton',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    to: 'https://example.com',
    a: true,
  },
};

export const Active: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    to: 'https://example.com',
    a: true,
    active: true,
  },
};

export const External: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    to: 'https://example.com',
    a: true,
    active: true,
    external: true,
  },
};
