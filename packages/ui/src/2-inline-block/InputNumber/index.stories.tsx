import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {InputNumber, InputNumber as Component, type InputNumberProps} from '.';
import {SliderHandle} from '../../1-inline/SliderHandle';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/InputNumber',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Demo: React.FC<InputNumberProps> = (props) => {
  const [value, setValue] = React.useState<number | undefined>(props.value ?? 16);

  return (
    <div style={{width: 220}}>
      <Component {...props} value={value} onChange={setValue} />
      <div style={{marginTop: 12, fontSize: 12, opacity: 0.6}}>value: {String(value)}</div>
    </div>
  );
};

type Story = StoryObj<typeof Component>;

export const Basic: Story = {
  render: (args) => <Demo {...args} />,
};

export const FontSize: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 16,
    min: 8,
    max: 96,
    step: 1,
    inputProps: {label: 'Font size'},
  },
};

export const Decimal: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 1,
    min: 0,
    max: 5,
    step: 0.25,
  },
};

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: 12,
    disabled: true,
  },
};

export const WithDragHandle: Story = {
  name: 'With drag handle',
  render: (args) => <Demo {...args} />,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    drag: true,
    inputProps: {label: 'Opacity'},
  },
};

export const DragDecimal: Story = {
  name: 'Drag handle (decimal)',
  render: (args) => <Demo {...args} />,
  args: {
    value: 1.5,
    min: 0,
    max: 10,
    step: 0.01,
    drag: true,
  },
};

export const DragUnbounded: Story = {
  name: 'Drag handle (unbounded)',
  render: (args) => <Demo {...args} />,
  args: {
    value: 0,
    step: 1,
    drag: true,
    dragSensitivity: 0.5,
  },
};

export const DragFancyHandle: Story = {
  name: 'Drag handle (fancy SliderHandle)',
  render: (args) => <Demo {...args} />,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    drag: true,
    dragHandle: <SliderHandle />,
    dragStartDotSize: 4,
    inputProps: {label: 'Volume'},
  },
};

const CommitOnlyDemo: React.FC = () => {
  const [persisted, setPersisted] = React.useState(50);
  const [realtimeCount, setRealtimeCount] = React.useState(0);
  const [commitCount, setCommitCount] = React.useState(0);

  return (
    <div style={{minWidth: 320, display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{fontSize: 12, opacity: 0.7, lineHeight: 1.5}}>
        Drag the handle: <code>onChange</code> still fires per-move (real-time counter goes up), but the
        consumer here only persists from <code>onChangeEnd</code>. Try dragging vs. clicking +/-.
      </div>
      <InputNumber
        dragSensitivity={0.1}
        value={persisted}
        onChange={() => setRealtimeCount((c) => c + 1)}
        onChangeEnd={(v) => {
          setPersisted(v);
          setCommitCount((c) => c + 1);
        }}
        min={0}
        max={100}
        step={1}
        drag
        inputProps={{label: 'Persisted value'}}
      />
      <div style={{fontSize: 12, fontFamily: 'monospace', display: 'flex', gap: 16}}>
        <span>
          persisted: <strong>{persisted}</strong>
        </span>
        <span>onChange #: {realtimeCount}</span>
        <span>onChangeEnd #: {commitCount}</span>
      </div>
    </div>
  );
};

export const DragCommitOnly: Story = {
  name: 'Drag with onChangeEnd (commit-only persistence)',
  render: () => <CommitOnlyDemo />,
};
