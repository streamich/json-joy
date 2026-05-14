import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BlobFace as Component, type BlobFaceHandle} from '.';

const buttonStyle: React.CSSProperties = {
  border: '1px solid #d0d4db',
  borderRadius: 999,
  background: '#fff',
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1,
  cursor: 'pointer',
};

const GestureDemo: React.FC<React.ComponentProps<typeof Component>> = (args) => {
  const [handle, setHandle] = React.useState<BlobFaceHandle | null>(null);

  return (
    <div style={{display: 'grid', gap: 18, justifyItems: 'center', minWidth: 280}}>
      <Component {...args} onHandle={setHandle} />
      <div style={{display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center'}}>
        <button type="button" style={buttonStyle} onClick={() => handle?.yes()} disabled={!handle}>
          yes()
        </button>
        <button type="button" style={buttonStyle} onClick={() => handle?.no()} disabled={!handle}>
          no()
        </button>
        <button type="button" style={buttonStyle} onClick={() => handle?.idk()} disabled={!handle}>
          idk()
        </button>
      </div>
      <div style={{maxWidth: 320, textAlign: 'center', fontSize: 13, lineHeight: 1.5, color: '#505866'}}>
        Trigger the imperative handle to make the blob nod, shake, or swivel without hovering it.
      </div>
    </div>
  );
};

const meta: Meta<typeof Component> = {
  title: '1. Inline/BlobFace',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onHandle: {control: false, table: {disable: true}},
    size: {control: {type: 'range', min: 16, max: 96, step: 2}},
    title: {control: 'text'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    size: 40,
    title: 'BlobFace',
  },
};

export const Sizes: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 16}}>
      {[20, 28, 36, 48, 64].map((size) => (
        <Component key={size} size={size} title={`BlobFace ${size}`} />
      ))}
    </div>
  ),
};

export const InTextFlow: StoryObj<typeof meta> = {
  render: () => (
    <div style={{fontSize: 18, lineHeight: 1.6, maxWidth: 420}}>
      The status mascot <Component size={28} title="BlobFace mascot" style={{margin: '0 6px -4px'}} /> watches the
      pointer, blinks sometimes, and gets very pleased when hovered.
    </div>
  ),
};

export const Crowd: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', padding: 12}}>
      <Component size={24} title="BlobFace 1" />
      <Component size={32} title="BlobFace 2" />
      <Component size={40} title="BlobFace 3" />
      <Component size={52} title="BlobFace 4" />
    </div>
  ),
};

export const Gestures: StoryObj<typeof meta> = {
  args: {
    size: 56,
    title: 'BlobFace gestures',
  },
  render: (args: React.ComponentProps<typeof Component>) => <GestureDemo {...args} />,
};
