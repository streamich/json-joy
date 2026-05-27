import * as React from 'react';
import {PlaceholderParagraph as Component} from './PlaceholderParagraph';
import {PlaceholderWords} from './PlaceholderWords';
import {PlaceholderCaret} from './PlaceholderCaret';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderParagraph',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const wrap = (children: React.ReactNode, w = '560px'): React.ReactElement => (
  <div style={{width: w, padding: '32px', fontSize: '20px', lineHeight: '32px'}}>{children}</div>
);

export const Basic: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderWords count={24} />
      </Component>,
    ),
};

export const WithPrefix: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        Lorem ipsum <PlaceholderWords count={20} />
      </Component>,
    ),
};

export const WithSuffix: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderWords count={20} trailing /> sum of its parts.
      </Component>,
    ),
};

export const WithPrefixAndSuffix: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        Collaboration is <PlaceholderWords count={18} trailing /> quiet magic.
      </Component>,
    ),
};

export const WithCaret: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        Collaboration is the quiet magic
        <PlaceholderCaret name="Monaco" color="#5FCC8A" height="24px" /> <PlaceholderWords count={20} />
      </Component>,
    ),
};

export const Seeded: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <Component>
          <PlaceholderWords count={20} seed={1} />
        </Component>
        <Component>
          <PlaceholderWords count={20} seed={2} />
        </Component>
        <Component>
          <PlaceholderWords count={20} seed={3} />
        </Component>
      </div>,
    ),
};

export const SmallWords: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderWords count={40} minWidth={16} maxWidth={60} height={8} />
      </Component>,
    ),
};

export const TallWords: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderWords count={18} minWidth={40} maxWidth={160} height={20} />
      </Component>,
    ),
};

const darkWrap: React.CSSProperties = {
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
    <div style={darkWrap}>
      <Component>
        Collaboration is the quiet magic
        <PlaceholderCaret name="Monaco" color="#5FCC8A" height="24px" />{' '}
        <PlaceholderWords count={12} seed={7} minWidth={36} maxWidth={140} height={14} trailing />
        <PlaceholderCaret name="Leonidas" color="#985DF7" placement="tl" height="24px" />{' '}
        <PlaceholderWords count={6} seed={13} minWidth={36} maxWidth={140} height={14} trailing />
        sum of its
        <PlaceholderCaret color="#58B9F8" height="24px" />
      </Component>
    </div>
  ),
};

export const LongParagraph: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderWords count={80} seed={42} />
      </Component>,
      '720px',
    ),
};
