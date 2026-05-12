import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {InputChar as Component, type InputCharProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputChar',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<InputCharProps> = (props) => {
  const [value, setValue] = React.useState(props.value ?? '');
  return (
    <div style={{minWidth: 280}}>
      <Component {...props} value={value} onChange={setValue} />
      <div style={{marginTop: 12, fontFamily: 'monospace', opacity: 0.6}}>
        value: {JSON.stringify(value)}
      </div>
    </div>
  );
};

export const CharOnly: StoryObj<typeof meta> = {
  name: 'Single character',
  args: {
    placeholder: 'Type one char',
  },
  render: (args) => <Demo {...args} />,
};

export const WithEmoji: StoryObj<typeof meta> = {
  name: 'With emoji picker',
  args: {
    emoji: true,
    placeholder: 'Type or pick',
  },
  render: (args) => <Demo {...args} />,
};

export const EmojiOnly: StoryObj<typeof meta> = {
  name: 'Emoji only',
  args: {
    emoji: 'only',
  },
  render: (args) => <Demo {...args} />,
};

export const WithLabel: StoryObj<typeof meta> = {
  name: 'With label',
  args: {
    label: 'Icon',
    emoji: true,
    placeholder: '🙂 or any character',
  },
  render: (args) => <Demo {...args} />,
};

export const PrefilledEmoji: StoryObj<typeof meta> = {
  name: 'Prefilled emoji',
  args: {
    emoji: true,
    value: '🚀',
  },
  render: (args) => <Demo {...args} />,
};

export const Disabled: StoryObj<typeof meta> = {
  name: 'Disabled',
  args: {
    emoji: true,
    disabled: true,
    value: '🚀',
  },
  render: (args) => <Demo {...args} />,
};

export const Gallery: StoryObj<typeof meta> = {
  name: 'Gallery',
  render: () => {
    const [a, setA] = React.useState('');
    const [b, setB] = React.useState('');
    const [c, setC] = React.useState('🎯');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 20, minWidth: 320}}>
        <div>
          <div style={{fontSize: 12, marginBottom: 4, opacity: 0.6}}>Plain char input</div>
          <Component value={a} onChange={setA} placeholder="One char only" />
        </div>
        <div>
          <div style={{fontSize: 12, marginBottom: 4, opacity: 0.6}}>Char + emoji picker</div>
          <Component value={b} onChange={setB} emoji placeholder="Type or pick emoji" />
        </div>
        <div>
          <div style={{fontSize: 12, marginBottom: 4, opacity: 0.6}}>Emoji-only picker</div>
          <Component value={c} onChange={setC} emoji="only" />
        </div>
      </div>
    );
  },
};
