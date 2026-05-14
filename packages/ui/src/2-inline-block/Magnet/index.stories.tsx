import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Magnet, type MagnetProps} from '.';

const meta: Meta<typeof Magnet> = {
  title: '2. Inline Block/Magnet',
  component: Magnet,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const Pill: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <button
    type="button"
    style={{
      padding: '12px 24px',
      borderRadius: 999,
      border: 0,
      cursor: 'pointer',
      fontFamily: 'system-ui',
      fontSize: 14,
      background: '#1f6feb',
      color: '#fff',
    }}
  >
    {children ?? 'Hover near me'}
  </button>
);

const Demo: React.FC<MagnetProps> = (props) => (
  <div style={{padding: 120}}>
    <Magnet {...props}>
      <Pill />
    </Magnet>
  </div>
);

export const Primary: StoryObj<typeof Magnet> = {
  render: (args) => <Demo {...args} />,
  args: {threshold: 80, strength: 0.25, max: 24},
};

export const Strong: StoryObj<typeof Magnet> = {
  render: (args) => <Demo {...args} />,
  args: {threshold: 140, strength: 0.45, max: 40, stiffness: 0.2, damping: 0.72},
};

export const Subtle: StoryObj<typeof Magnet> = {
  render: (args) => <Demo {...args} />,
  args: {threshold: 50, strength: 0.12, max: 8},
};

export const Row: StoryObj<typeof Magnet> = {
  render: (args) => (
    <div style={{display: 'flex', gap: 32, padding: 80}}>
      <Magnet {...args}>
        <Pill>One</Pill>
      </Magnet>
      <Magnet {...args}>
        <Pill>Two</Pill>
      </Magnet>
      <Magnet {...args}>
        <Pill>Three</Pill>
      </Magnet>
    </div>
  ),
  args: {threshold: 80, strength: 0.3, max: 20},
};
