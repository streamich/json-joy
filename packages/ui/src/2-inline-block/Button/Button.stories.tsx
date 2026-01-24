import * as React from 'react';
import {Button as Component} from '.';
import {Iconista} from '../../icons/Iconista';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Button',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    children: 'Default Button',
  },
};

export const Success: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    color: 'success',
    primary: true,
  },
};

export const Accent: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    color: 'accent',
    primary: true,
  },
};

export const ErrorState: StoryObj<typeof meta> = {
  args: {
    children: 'Click me',
    color: 'error',
    primary: true,
  },
};

export const Outline: StoryObj<typeof meta> = {
  args: {
    children: 'Button with outline',
    outline: true,
  },
};

export const OutlineAccent: StoryObj<typeof meta> = {
  args: {
    children: 'Button with outline',
    outline: true,
    color: 'accent',
    primary: true,
  },
};

export const Dashed: StoryObj<typeof meta> = {
  args: {
    children: 'Button with outline',
    outline: true,
    dashed: true,
    radius: 1,
  },
};

export const RadiusScale: StoryObj<typeof meta> = {
  args: {
    children: 'Click me!',
  },
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 8}}>
        {[-1, 0, 1].map((i) => (
          <Component key={i} {...args} radius={i} />
        ))}
      </div>
    );
  },
};

export const SizeScale: StoryObj<typeof meta> = {
  args: {
    children: 'Click me!',
  },
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 8}}>
        {[-2, -1, 0, 1, 2].map((i) => (
          <Component key={i} {...args} size={i as any} />
        ))}
      </div>
    );
  },
};

export const Icon: StoryObj<typeof meta> = {
  args: {
    children: 'Button with icon',
    icon: <Iconista width={16} height={16} set={'lucide'} icon={'copy'} />,
  },
};
