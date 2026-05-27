import * as React from 'react';
import {PlaceholderCursor as Component} from './PlaceholderCursor';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderCursor',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'color'},
    labelColor: {control: 'color'},
  },
};

export default meta;

const wrap = (children: React.ReactNode, w = '420px') => <div style={{width: w, padding: '64px'}}>{children}</div>;

export const Basic: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Monaco" color="#5FCC8A" />),
};

export const NoFlag: StoryObj<typeof meta> = {
  render: () => wrap(<Component color="#E44A28" />),
};

export const Big: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Leonidas" color="#985DF7" size={40} />),
};

export const Tiny: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="ant" color="#58B9F8" size={14} />),
};

export const Colors: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', gap: '48px', alignItems: 'flex-start'}}>
        <Component name="Monaco" color="#5FCC8A" />
        <Component name="Leonidas" color="#985DF7" />
        <Component name="Marko" color="#58B9F8" />
        <Component name="Priya" color="#F6A832" />
        <Component name="Sam" color="#EE69B1" />
        <Component name="Dev" color="#E44A28" />
      </div>,
      '720px',
    ),
};

export const CustomFlagOffset: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="up-right" color="#5FCC8A" flagOffset={[18, -8]} />),
};

const canvasStyle: React.CSSProperties = {
  position: 'relative',
  width: '560px',
  height: '320px',
  padding: '24px',
  background: '#0E0E10',
  borderRadius: '12px',
  overflow: 'hidden',
};

const at = (left: number, top: number, child: React.ReactNode): React.ReactElement => (
  <span style={{position: 'absolute', left, top}}>{child}</span>
);

export const Canvas: StoryObj<typeof meta> = {
  render: () => (
    <div style={canvasStyle}>
      {at(60, 40, <Component name="Monaco" color="#5FCC8A" />)}
      {at(280, 90, <Component name="Leonidas" color="#985DF7" />)}
      {at(140, 200, <Component name="Marko" color="#58B9F8" />)}
      {at(380, 230, <Component name="Priya" color="#F6A832" />)}
    </div>
  ),
};
