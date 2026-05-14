import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {SliderHandle as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/SliderHandle',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const Wrap: React.FC<{label: string; children: React.ReactNode; bg?: string}> = ({label, children, bg}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: 20,
      background: bg ?? 'transparent',
      borderRadius: 8,
    }}
  >
    <span style={{fontSize: 12, opacity: 0.6, fontFamily: 'system-ui'}}>{label}</span>
    {children}
  </div>
);

export const Default: StoryObj<typeof meta> = {
  args: {},
  render: (args) => <Component {...args} />,
};

export const States: StoryObj<typeof meta> = {
  name: 'All states',
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Wrap label="idle">
        <Component />
      </Wrap>
      <Wrap label="dragging">
        <Component dragging />
      </Wrap>
      <Wrap label="disabled">
        <Component disabled />
      </Wrap>
    </div>
  ),
};

export const CustomColor: StoryObj<typeof meta> = {
  name: 'Custom thumb color',
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Wrap label="amber">
        <Component background="#f5a524" />
      </Wrap>
      <Wrap label="emerald">
        <Component background="#17c964" />
      </Wrap>
      <Wrap label="rose">
        <Component background="#f31260" />
      </Wrap>
    </div>
  ),
};

const FakeRail: React.FC<{value: number; dragging?: boolean; children: React.ReactNode}> = ({value, children}) => (
  <div
    style={{
      position: 'relative',
      width: 220,
      height: 7,
      borderRadius: 7,
      background: '#c0c0c0',
      boxShadow: '0 1px 0 rgba(255,255,255,0.25), inset 0 0 4px rgba(0,0,0,0.9)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: value + '%',
        height: '100%',
        borderRadius: 7,
        background: '#3366FF',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: value + '%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {children}
    </div>
  </div>
);

export const OnRail: StoryObj<typeof meta> = {
  name: 'On a rail (Slider visual)',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <FakeRail value={20}>
        <Component />
      </FakeRail>
      <FakeRail value={60}>
        <Component dragging />
      </FakeRail>
    </div>
  ),
};
