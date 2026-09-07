import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Check as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Check',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {control: 'boolean'},
    indeterminate: {control: 'boolean'},
    disabled: {control: 'boolean'},
    readOnly: {control: 'boolean'},
    error: {control: 'boolean'},
    color: {control: 'color'},
    roundness: {control: {type: 'range', min: 0, max: 1, step: 0.01}},
    size: {control: {type: 'range', min: 12, max: 48, step: 1}},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const Row: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>{children}</div>
);

export const Primary: Story = {
  args: {checked: true},
};

/** The three logical states: off, on, and mixed (indeterminate). */
export const States: Story = {
  render: () => (
    <Row>
      <Component />
      <Component checked />
      <Component indeterminate />
    </Row>
  ),
};

/** Affordances: default, disabled (off/on), read-only, and the error state. */
export const Affordances: Story = {
  render: () => (
    <Row>
      <Component checked />
      <Component checked disabled />
      <Component disabled />
      <Component checked readOnly />
      <Component error />
      <Component error checked />
    </Row>
  ),
};

/** Controlled: the parent owns the state; `onChange` reports user toggles. */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <label
        htmlFor="check-controlled"
        style={{display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}
      >
        <Component id="check-controlled" checked={checked} onChange={setChecked} />
        <span>{checked ? 'Checked' : 'Unchecked'}</span>
      </label>
    );
  },
};

/** Any CSS color. */
export const Colors: Story = {
  render: () => (
    <Row>
      <Component checked color="#6c5ce7" />
      <Component checked color="#0984e3" />
      <Component checked color="#00b894" />
      <Component checked color="#e17055" />
      <Component checked color="#fdcb6e" />
    </Row>
  ),
};

/** Continuous corner `roundness` (`0` … `1`): squarer → full circle. */
export const Roundness: Story = {
  render: () => (
    <Row>
      {[0, 0.25, 0.5, 0.75, 1].map((roundness) => (
        <Component key={roundness} checked size={28} color="#6c5ce7" roundness={roundness} />
      ))}
    </Row>
  ),
};

/** Replace the checkmark with any node — including an emoji. */
export const CustomIcon: Story = {
  render: () => (
    <Row>
      <Component checked icon="✅" color="transparent" />
      <Component checked icon="⭐" color="transparent" />
      <Component checked icon="🔥" color="transparent" />
      <Component
        checked
        color="#6c5ce7"
        icon={
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l2.6 5.6 6 .8-4.4 4.1 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" fill="#fff" />
          </svg>
        }
      />
    </Row>
  ),
};

/** Scales to any size; the mark and corner radius scale with the box. */
export const Sizes: Story = {
  render: () => (
    <Row>
      {[14, 18, 22, 28, 36].map((size) => (
        <Component key={size} checked size={size} />
      ))}
    </Row>
  ),
};

/** A small task list built from controlled checks. */
export const TaskList: Story = {
  render: () => {
    const [done, setDone] = React.useState<Record<string, boolean>>({a: true, b: false, c: false});
    const item = (id: string, text: string) => (
      <label htmlFor={`task-${id}`} style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'}}>
        <Component
          id={`task-${id}`}
          checked={!!done[id]}
          color="#00b894"
          onChange={(v) => setDone((d) => ({...d, [id]: v}))}
        />
        <span style={{textDecoration: done[id] ? 'line-through' : undefined, opacity: done[id] ? 0.6 : 1}}>{text}</span>
      </label>
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {item('a', 'Land behind a feature flag')}
        {item('b', 'Internal dogfood')}
        {item('c', 'Staged rollout')}
      </div>
    );
  },
};
