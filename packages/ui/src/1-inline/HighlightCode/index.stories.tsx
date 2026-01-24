import * as React from 'react';
import {HighlightCode as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '1. Inline/HighlightCode',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    code: 'console.log(123)',
    lang: 'javascript',
  },
};

const code = `
import {Avatar} from '@onp4/ui/lib/inline/Avatar';

<Avatar width={64} src={''} />

const Component = () => {
  return (
    <div style={{border: '1px solid red'}}>
      <h1 alt>Hello World</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
};
`;

export const JSX: StoryObj<typeof meta> = {
  args: {
    code,
    lang: 'jsx',
  },
  decorators: [
    (Story) => (
      <pre style={{width: 400}}>
        <Story />
      </pre>
    ),
  ],
};
