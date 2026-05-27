import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CheckList as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '5. Block/CheckList',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const items = [
  'Bind native <input> and <textarea> elements',
  'CodeMirror, Monaco, and Ace integrations',
  'A fast text diff keeps sync invisible',
  'Fuzz-tested convergence under adversarial edits',
];

export const Primary: StoryObj<typeof meta> = {
  args: {items},
  decorators: [
    (Story: any) => (
      <div style={{width: 420}}>
        <Story />
      </div>
    ),
  ],
};

export const TwoColumns: StoryObj<typeof meta> = {
  args: {items: [...items, 'Offline-first by default', 'Tiny runtime footprint'], columns: 2},
  decorators: [
    (Story: any) => (
      <div style={{width: 720}}>
        <Story />
      </div>
    ),
  ],
};

export const Tinted: StoryObj<typeof meta> = {
  args: {items, color: '#2563eb'},
  decorators: [
    (Story: any) => (
      <div style={{width: 420}}>
        <Story />
      </div>
    ),
  ],
};
