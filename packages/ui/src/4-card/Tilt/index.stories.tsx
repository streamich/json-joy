import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Tilt, type TiltProps} from '.';
import {Border} from '../Border';
import {Spotlight} from '../Spotlight';

const meta: Meta<typeof Tilt> = {
  title: '4. Card/Tilt',
  component: Tilt,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const Card: React.FC<{children?: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      width: 320,
      height: 200,
      borderRadius: 16,
      padding: 24,
      background: dark ? '#0e1014' : 'rgba(127,127,127,0.06)',
      color: dark ? '#e8eaed' : 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      fontSize: 14,
      boxSizing: 'border-box',
    }}
  >
    {children ?? <span>Tilt me</span>}
  </div>
);

const Demo: React.FC<TiltProps> = (props) => (
  <Tilt {...props}>
    <Card />
  </Tilt>
);

export const Primary: StoryObj<typeof Tilt> = {
  render: (args) => <Demo {...args} />,
  args: {max: 8, perspective: 700, scale: 1},
};

export const Pop: StoryObj<typeof Tilt> = {
  render: (args) => <Demo {...args} />,
  args: {max: 10, perspective: 700, scale: 1.1},
};

export const Reverse: StoryObj<typeof Tilt> = {
  render: (args) => <Demo {...args} />,
  args: {max: 8, perspective: 700, scale: 1, reverse: true},
};

export const Reach: StoryObj<typeof Tilt> = {
  render: (args) => (
    <div style={{padding: 120}}>
      <Demo {...args} />
    </div>
  ),
  args: {max: 10, perspective: 700, scale: 1.02, reach: 160},
};

export const Composed: StoryObj<typeof Tilt> = {
  render: (args) => (
    <Tilt {...args}>
      <Border borderRadius={16} thickness={1.5} radius={200}>
        <Spotlight borderRadius={16} radius={240} color="rgba(255,255,255,0.18)">
          <Card dark>
            <span>Tilt + Border + Spotlight</span>
          </Card>
        </Spotlight>
      </Border>
    </Tilt>
  ),
  args: {max: 9, perspective: 700, scale: 1.02},
};
