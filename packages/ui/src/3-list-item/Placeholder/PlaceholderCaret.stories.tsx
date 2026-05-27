import * as React from 'react';
import {Placeholder} from '.';
import {PlaceholderCaret as Component} from './PlaceholderCaret';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderCaret',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['tl', 'tr', 'bl', 'br'],
    },
    color: {control: 'color'},
    labelColor: {control: 'color'},
  },
};

export default meta;

const wrap = (children: React.ReactNode, w = '420px') => <div style={{width: w, padding: '48px'}}>{children}</div>;

export const Basic: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Monaco" color="#5FCC8A" />),
};

export const NoFlag: StoryObj<typeof meta> = {
  render: () => wrap(<Component color="#E44A28" />),
};

export const TopRight: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Monaco" color="#5FCC8A" placement="tr" />),
};

export const TopLeft: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Leonidas" color="#985DF7" placement="tl" />),
};

export const BottomRight: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Marko" color="#58B9F8" placement="br" />),
};

export const BottomLeft: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Priya" color="#F6A832" placement="bl" />),
};

export const Colors: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', gap: '48px', alignItems: 'flex-end'}}>
        <Component name="Monaco" color="#5FCC8A" />
        <Component name="Leonidas" color="#985DF7" />
        <Component name="Marko" color="#58B9F8" />
        <Component name="Priya" color="#F6A832" />
        <Component name="Sam" color="#EE69B1" />
        <Component name="Dev" color="#E44A28" />
      </div>,
      '640px',
    ),
};

export const Tall: StoryObj<typeof meta> = {
  render: () => wrap(<Component name="Monaco" color="#5FCC8A" height="32px" />),
};

const illustrationWrap: React.CSSProperties = {
  width: '560px',
  padding: '32px',
  background: '#0E0E10',
  borderRadius: '12px',
  color: '#fff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '20px',
  lineHeight: '32px',
};

export const Illustration: StoryObj<typeof meta> = {
  render: () => (
    <div style={illustrationWrap}>
      <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px'}}>
        <span>Collaboration should be in any product</span>
        <Component name="Monaco" color="#5FCC8A" height="24px" />
      </div>
      <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
        <Placeholder variant="block" width="80px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
      </div>
      <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
        <Placeholder variant="block" width="120px" height="20px" />
        <Placeholder variant="block" width="60px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
        <Placeholder variant="block" width="80px" height="20px" />
      </div>
      <div style={{display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center'}}>
        <Placeholder variant="block" width="120px" height="20px" />
        <Placeholder variant="block" width="160px" height="20px" />
        <Component name="Leonidas" color="#985DF7" placement="tl" height="24px" />
      </div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <Placeholder variant="block" width="40px" height="20px" />
        <Placeholder variant="block" width="40px" height="20px" />
        <span>lets go!</span>
        <Component color="#58B9F8" height="24px" />
      </div>
    </div>
  ),
};

export const InlineWithText: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{fontSize: '16px', lineHeight: '24px'}}>
        Hello world
        <Component name="Monaco" color="#5FCC8A" />, this is a sentence.
      </div>,
    ),
};

export const AllPlacements: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px 96px'}}>
        <Component name="tl" color="#985DF7" placement="tl" />
        <Component name="tr" color="#5FCC8A" placement="tr" />
        <Component name="bl" color="#F6A832" placement="bl" />
        <Component name="br" color="#58B9F8" placement="br" />
      </div>,
      '320px',
    ),
};
