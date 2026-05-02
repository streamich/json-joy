import * as React from 'react';
import {ErrorBoundary as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const Boom: React.FC<{message?: string}> = ({message = 'Something exploded'}) => {
  throw new Error(message);
};

const Healthy: React.FC = () => (
  <div style={{padding: 24, background: '#f6f6f6', borderRadius: 8}}>I render fine.</div>
);

const Toggle: React.FC<{children: (broken: boolean) => React.ReactNode}> = ({children}) => {
  const [broken, setBroken] = React.useState(true);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', minWidth: 360}}>
      <button
        type="button"
        onClick={() => setBroken((b) => !b)}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #ccc',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        {broken ? 'Stop crashing' : 'Make it crash'}
      </button>
      {children(broken)}
    </div>
  );
};

const meta: Meta<typeof Component> = {
  title: 'Miscellaneous/ErrorBoundary',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {control: 'text'},
    compact: {control: 'boolean'},
    silent: {control: 'boolean'},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    name: 'Demo',
    children: <Boom />,
  },
};

export const HealthyTree: StoryObj<typeof meta> = {
  name: 'Healthy (no error)',
  args: {
    name: 'Demo',
    children: <Healthy />,
  },
};

export const Compact: StoryObj<typeof meta> = {
  args: {
    name: 'Inline thing',
    compact: true,
    children: <Boom message="Inline failure" />,
  },
};

export const NoName: StoryObj<typeof meta> = {
  name: 'Without name',
  args: {
    children: <Boom />,
  },
};

export const LongMessage: StoryObj<typeof meta> = {
  args: {
    name: 'Decoder',
    children: <Boom message="NOT_TUPLE: tuple node referenced by slice chunk did not resolve to a VecNode in the model index" />,
  },
};

export const Silent: StoryObj<typeof meta> = {
  name: 'Silent fallback',
  render: (args) => (
    <div
      style={{
        minWidth: 360,
        minHeight: 80,
        padding: 16,
        border: '1px dashed #bbb',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontSize: 12,
      }}
    >
      <Component {...args}>
        <Boom />
      </Component>
      <span>(silent boundary renders nothing — this dashed box is just the surrounding container)</span>
    </div>
  ),
  args: {
    silent: true,
  },
};

export const CustomFallback: StoryObj<typeof meta> = {
  args: {
    name: 'Custom',
    renderError: (error, reset) => (
      <div
        style={{
          padding: 16,
          background: '#fff7f0',
          border: '1px solid #f0c69b',
          borderRadius: 8,
          color: '#8b4a00',
          fontSize: 13,
          minWidth: 320,
          textAlign: 'center',
        }}
      >
        <div style={{fontWeight: 700, marginBottom: 6}}>Custom fallback</div>
        <div style={{fontFamily: 'monospace', fontSize: 12, marginBottom: 10}}>{error.message}</div>
        <button
          type="button"
          onClick={reset}
          style={{padding: '4px 10px', borderRadius: 6, border: '1px solid #d39657', background: '#fff', cursor: 'pointer'}}
        >
          Reset
        </button>
      </div>
    ),
    children: <Boom message="custom-render demo" />,
  },
};

export const Recovers: StoryObj<typeof meta> = {
  name: 'Recovery via Try again',
  render: (args) => (
    <Toggle>
      {(broken) => (
        <Component {...args} resetKey={broken}>
          {broken ? <Boom message="I crash while broken=true" /> : <Healthy />}
        </Component>
      )}
    </Toggle>
  ),
  args: {
    name: 'Demo',
  },
};
