import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Badge as Component} from './Badge';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Badge/Badge',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

/** A self-contained portrait so the image story renders without a network. */
const portrait =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
      '<rect width="96" height="96" fill="#6c5ce7"/>' +
      '<circle cx="48" cy="38" r="18" fill="#fff"/>' +
      '<rect x="20" y="60" width="56" height="40" rx="20" fill="#fff"/>' +
      '</svg>',
  );

export const Primary: Story = {
  args: {
    name: 'Mr Name',
    avatar: {name: 'Mr Name'},
  },
};

export const WithSubtext: Story = {
  args: {
    name: 'Ada Lovelace',
    subtext: 'ada@example.com',
    avatar: {name: 'Ada Lovelace'},
  },
};

export const WithImage: Story = {
  args: {
    name: 'Grace Hopper',
    subtext: 'Rear Admiral',
    avatar: {name: 'Grace Hopper', src: portrait},
  },
};

export const WithEmoji: Story = {
  args: {
    name: 'Friendly Bot',
    subtext: 'online',
    avatar: {emoji: '🤖'},
  },
};

export const You: Story = {
  args: {
    name: 'Alan Turing',
    you: true,
    avatar: {name: 'Alan Turing'},
  },
};

export const Grey: Story = {
  args: {
    name: 'Deactivated',
    subtext: 'account suspended',
    grey: true,
    avatar: {name: 'Deactivated', grey: true},
  },
};

export const Private: Story = {
  args: {
    name: 'Secret Document',
    subtext: 'only you can see this',
    avatar: {name: 'Secret Document', isPrivate: true},
  },
};

export const Square: Story = {
  args: {
    name: 'Acme Inc.',
    subtext: 'organization',
    avatar: {name: 'Acme Inc.', square: true},
  },
};

export const Spacious: Story = {
  args: {
    width: 48,
    name: 'Spacious Layout',
    subtext: 'extra breathing room',
    spacious: true,
    avatar: {name: 'Spacious Layout'},
  },
};

export const HiddenName: Story = {
  args: {
    name: 'Hidden Name',
    hideName: true,
    subtext: 'name is hidden, subtext shown',
    avatar: {name: 'Hidden Name'},
  },
};

export const Clickable: Story = {
  args: {
    name: 'Click anywhere',
    subtext: 'the whole row is a button',
    avatar: {name: 'Click anywhere'},
    onClick: () => {},
  },
};

export const SizeScale: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {[24, 32, 40, 48, 64].map((width) => (
        <Component
          key={width}
          width={width}
          name={`${width}px avatar`}
          subtext="resizes icon and text together"
          avatar={{name: 'Size Scale'}}
        />
      ))}
    </div>
  ),
};

/**
 * Truncation only kicks in when the row is width-constrained — here a 200px
 * box forces both the name and the subtext to ellipsize.
 */
export const Truncated: Story = {
  render: () => (
    <div style={{width: 200, border: '1px dashed rgba(0,0,0,0.15)'}}>
      <Component
        name="A very long display name that does not fit"
        subtext="an equally long secondary line that overflows too"
        avatar={{name: 'Long Name'}}
      />
    </div>
  ),
};
