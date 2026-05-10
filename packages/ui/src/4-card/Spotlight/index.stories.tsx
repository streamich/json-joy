import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Spotlight, type SpotlightProps} from '.';

const meta: Meta<typeof Spotlight> = {
  title: '4. Card/Spotlight',
  component: Spotlight,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const Hero: React.FC<{dark?: boolean; children?: React.ReactNode; radius?: number}> = ({
  dark = true,
  children,
  radius = 16,
}) => (
  <div
    style={{
      width: 480,
      height: 240,
      borderRadius: radius,
      padding: 32,
      background: dark ? '#0e1014' : 'rgba(127,127,127,0.06)',
      color: dark ? '#e8eaed' : 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      fontSize: 18,
      boxSizing: 'border-box',
    }}
  >
    {children ?? <span>Hover me — soft flashlight follows the cursor</span>}
  </div>
);

const Demo: React.FC<SpotlightProps & {dark?: boolean}> = ({dark, ...rest}) => (
  <Spotlight {...rest}>
    <Hero dark={dark} radius={typeof rest.borderRadius === 'number' ? rest.borderRadius : 16} />
  </Spotlight>
);

export const Dark: StoryObj<typeof Spotlight> = {
  render: (args) => <Demo dark {...args} />,
  args: {borderRadius: 16, radius: 240, color: 'rgba(255,255,255,0.16)'},
};

export const Light: StoryObj<typeof Spotlight> = {
  render: (args) => <Demo {...args} />,
  args: {borderRadius: 16, radius: 330, color: 'rgba(255,255,255,.08)'},
};

export const Tight: StoryObj<typeof Spotlight> = {
  render: (args) => <Demo dark {...args} />,
  args: {borderRadius: 16, radius: 120, color: 'rgba(255,255,255,0.22)', falloff: 0.55},
};

export const Reach: StoryObj<typeof Spotlight> = {
  render: (args) => (
    <div style={{padding: 120}}>
      <Demo dark {...args} />
    </div>
  ),
  args: {borderRadius: 16, radius: 280, color: 'rgba(255,255,255,0.18)', reach: 160},
};
