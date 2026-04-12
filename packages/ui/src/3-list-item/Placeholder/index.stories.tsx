import * as React from 'react';
import {Placeholder as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'button', 'paragraph', 'image', 'card', 'block'],
    },
  },
};

export default meta;

const wrap = (children: React.ReactNode) => (
  <div style={{width: '320px', padding: '16px'}}>{children}</div>
);

export const TextLine: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="text" />),
};

export const Button: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="button" />),
};

export const Paragraph: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="paragraph" lines={3} />),
};

export const Image: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="image" />),
};

export const Card: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="card" />),
};

export const Block: StoryObj<typeof meta> = {
  render: () => wrap(<Component variant="block" />),
};

export const AllVariants: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Component variant="image" />
        <Component variant="text" width="40%" />
        <Component variant="paragraph" lines={3} />
        <Component variant="button" />
      </div>,
    ),
};
