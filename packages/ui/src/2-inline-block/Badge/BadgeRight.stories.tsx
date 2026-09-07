import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {BadgeRight as Component} from './BadgeRight';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Badge/BadgeRight',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  // `BadgeRight` is the text column of a label; it stretches to fill its
  // parent, so give it a fixed width to view in isolation.
  decorators: [
    (Story) => (
      <div style={{width: 220, border: '1px dashed rgba(0,0,0,0.15)'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NameOnly: Story = {
  args: {
    name: 'Ada Lovelace',
  },
};

export const WithSubtext: Story = {
  args: {
    name: 'Ada Lovelace',
    subtext: 'ada@example.com',
  },
};

export const SubtextOnly: Story = {
  args: {
    subtext: 'standalone subtext',
  },
};

export const You: Story = {
  args: {
    name: 'Alan Turing',
    you: true,
  },
};

export const Grey: Story = {
  args: {
    name: 'Muted name',
    subtext: 'muted subtext',
    grey: true,
  },
};

export const Spacious: Story = {
  args: {
    width: 48,
    name: 'Spacious',
    subtext: 'more vertical breathing room',
    spacious: true,
  },
};

export const HiddenName: Story = {
  args: {
    name: 'Hidden name',
    hideName: true,
    subtext: 'only the subtext renders',
  },
};

export const LongTextEllipsis: Story = {
  args: {
    name: 'A very long display name that should be truncated with an ellipsis',
    subtext: 'and a long secondary line that is also truncated when it overflows',
  },
};

export const Clickable: Story = {
  args: {
    name: 'Click the name',
    subtext: 'or click the subtext',
    onNameClick: () => {},
    onSubtextClick: () => {},
  },
};

export const WidthScale: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {[24, 32, 40, 48, 64].map((width) => (
        <Component key={width} width={width} name={`${width}px`} subtext="scales font with width" />
      ))}
    </div>
  ),
};
