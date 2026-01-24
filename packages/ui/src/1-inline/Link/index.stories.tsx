import * as React from 'react';
import {Link} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Link> = {
  title: '1. Inline/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {control: 'text'},
    a: {
      control: 'boolean',
      description: 'When set, <a> tag is used',
    },
    to: {control: 'text', description: 'URL to link to'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'Click me!',
    a: true,
    to: 'https://www.example.com',
  },
};

export const InParagraph: StoryObj<typeof meta> = {
  args: {
    children: 'Click me!',
    a: true,
    to: 'https://www.example.com',
  },
  decorators: [
    (Story) => (
      <p>
        <Story />
      </p>
    ),
  ],
};

export const External: StoryObj<typeof meta> = {
  args: {
    children: 'Click me!',
    a: true,
    to: 'https://www.example.com',
    external: true,
  },
  decorators: [
    (Story) => (
      <p>
        <Story />
      </p>
    ),
  ],
};
