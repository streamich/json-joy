import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Border, type BorderProps} from '.';

const meta: Meta<typeof Border> = {
  title: '4. Card/Border',
  component: Border,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const Card: React.FC<{radius?: number; children?: React.ReactNode}> = ({radius = 16, children}) => (
  <div
    style={{
      width: 320,
      height: 200,
      borderRadius: radius,
      padding: 24,
      background: 'rgba(127,127,127,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      fontSize: 14,
      boxSizing: 'border-box',
    }}
  >
    {children ?? <span>Move the cursor near my edges</span>}
  </div>
);

const Demo: React.FC<BorderProps> = (props) => (
  <Border {...props}>
    <Card radius={typeof props.borderRadius === 'number' ? props.borderRadius : 16} />
  </Border>
);

export const Primary: StoryObj<typeof Border> = {
  render: (args) => <Demo {...args} />,
  args: {borderRadius: 16, thickness: 1, radius: 160},
};

export const Thick: StoryObj<typeof Border> = {
  render: (args) => <Demo {...args} />,
  args: {borderRadius: 16, thickness: 2, radius: 200},
};

export const Pill: StoryObj<typeof Border> = {
  render: (args) => <Demo {...args} />,
  args: {borderRadius: 999, thickness: 1.5, radius: 140},
};

export const Reach: StoryObj<typeof Border> = {
  render: (args) => (
    <div style={{padding: 80}}>
      <Demo {...args} />
    </div>
  ),
  args: {borderRadius: 16, thickness: 1, radius: 200, reach: 120},
};

export const Trailing: StoryObj<typeof Border> = {
  render: (args) => (
    <div style={{padding: 80}}>
      <Demo {...args} />
    </div>
  ),
  args: {borderRadius: 16, thickness: 2, radius: 200, reach: 120, delay: 220},
};

export const Colorful: StoryObj<typeof Border> = {
  render: (args) => (
    <div style={{padding: 80}}>
      <Demo {...args} />
    </div>
  ),
  args: {
    borderRadius: 16,
    thickness: 2,
    radius: 220,
    reach: 120,
    delay: 180,
    colors: ['#07f', '#0ff 35%', '#f0f 70%'],
    falloff: 0.85,
  },
};
