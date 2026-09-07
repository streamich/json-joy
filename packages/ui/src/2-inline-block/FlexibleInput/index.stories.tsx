import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {FlexibleInput as Component, type FlexibleInputHandle, type FlexibleInputProps} from '.';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/FlexibleInput',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    value: 'Typ',
    typeahead: 'e something here',
  },
};

const box: React.CSSProperties = {
  border: '1px solid #bbb',
  borderRadius: 4,
  display: 'inline-block',
  padding: '4px 8px',
};

const InteractiveDemo: React.FC<Omit<FlexibleInputProps, 'value' | 'onChange'> & {noDemoDebug?: boolean}> = ({
  noDemoDebug,
  ...props
}) => {
  const [value, setValue] = React.useState('Hello World');
  return (
    <div>
      <div style={box}>
        <Component
          {...props}
          value={value}
          typeahead={props.typeahead || (value === 'n' ? 'ull' : value === 'f' ? 'alse' : '')}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      {!noDemoDebug && <div>Value: {value}</div>}
    </div>
  );
};

export const Interactive: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo />,
};

export const Multiline: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo multiline noDemoDebug />,
};

export const Wrap: StoryObj<typeof meta> = {
  args: {},
  render: () => (
    <div style={{width: 240}}>
      <InteractiveDemo multiline wrap fullWidth noDemoDebug />
    </div>
  ),
};

export const FullWidth: StoryObj<typeof meta> = {
  args: {},
  render: () => (
    <div style={{width: 320}}>
      <InteractiveDemo fullWidth noDemoDebug />
    </div>
  ),
};

export const TypeBefore: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo typebefore="$ " />,
};

export const MinWidth: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo minWidth={200} />,
};

export const MaxWidth: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo maxWidth={200} />,
};

export const ExtraWidth: StoryObj<typeof meta> = {
  args: {},
  render: () => <InteractiveDemo extraWidth={100} />,
};

/**
 * Demonstrates "uncontrolled" usage, where the value is driven externally
 * (here, through the imperative {@link FlexibleInputHandle} ref) instead of
 * through the `value` prop. This is the mode used when composing with
 * `<CollaborativeInput>`, which drives the underlying element via a CRDT
 * binding and calls `resize()` whenever the value changes externally.
 */
const UncontrolledDemo: React.FC = () => {
  const ref = React.useRef<FlexibleInputHandle>(null);
  const setExternally = (text: string) => {
    const input = ref.current?.input;
    if (!input) return;
    input.value = text;
    ref.current?.resize();
  };
  return (
    <div>
      <div style={box}>
        <Component ref={ref} uncontrolled defaultValue="Edit me, or use the buttons" />
      </div>
      <div style={{marginTop: 8, display: 'flex', gap: 4}}>
        <button type="button" onClick={() => setExternally('short')}>
          Set "short"
        </button>
        <button type="button" onClick={() => setExternally('a much, much longer value set externally')}>
          Set long value
        </button>
      </div>
    </div>
  );
};

export const Uncontrolled: StoryObj<typeof meta> = {
  args: {},
  render: () => <UncontrolledDemo />,
};
