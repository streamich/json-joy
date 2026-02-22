import * as React from 'react';
import {NextBlock as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '5. Block/NextBlock',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story) => (
      <div style={{padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    left: {
      title: (
        <>
          Chapter 2: <span style={{opacity: 0.6}}>The Future of the Universe</span>
        </>
      ),
      to: '/left',
    },
    right: {
      title: (
        <>
          Appendix 1: <span style={{opacity: 0.6}}>The Future of the Universe</span>
        </>
      ),
      to: '/right',
    },
  },
};

export const OnlyRight: StoryObj<typeof meta> = {
  args: {
    right: {
      title: 'Right',
      to: '/right',
    },
  },
};

export const OnlyLeft: StoryObj<typeof meta> = {
  args: {
    left: {
      title: 'Left',
      to: '/left',
    },
  },
};
