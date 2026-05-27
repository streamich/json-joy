import * as React from 'react';
import {PlaceholderRow as Component} from './PlaceholderRow';
import {PlaceholderWord} from './PlaceholderWord';
import {PlaceholderWords} from './PlaceholderWords';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderRow',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const wrap = (children: React.ReactNode, w = '480px'): React.ReactElement => (
  <div
    style={{
      width: w,
      padding: '32px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '14px',
      lineHeight: '22px',
    }}
  >
    {children}
  </div>
);

const codeText = (s: string) => <span style={{opacity: 0.6}}>{s}</span>;

export const Basic: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div>
        <Component>
          <PlaceholderWords count={4} seed={1} />
        </Component>
        <Component>
          <PlaceholderWords count={4} seed={2} />
        </Component>
        <Component>
          <PlaceholderWords count={4} seed={3} />
        </Component>
      </div>,
    ),
};

export const Indented: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div>
        <Component indent={0}>
          <PlaceholderWord width={60} />
        </Component>
        <Component indent={1}>
          <PlaceholderWord width={50} />
        </Component>
        <Component indent={2}>
          <PlaceholderWord width={40} />
        </Component>
        <Component indent={3}>
          <PlaceholderWord width={36} />
        </Component>
      </div>,
    ),
};

export const JsonLike: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div>
        <Component>{codeText('{')}</Component>
        <Component indent={1}>
          <PlaceholderWord variant="key" width={60} />
          {codeText(': ')}
          <PlaceholderWord variant="string" width={90} />
          {codeText(',')}
        </Component>
        <Component indent={1}>
          <PlaceholderWord variant="key" width={50} />
          {codeText(': ')}
          <PlaceholderWord variant="number" width={36} />
          {codeText(',')}
        </Component>
        <Component indent={1}>
          <PlaceholderWord variant="key" width={70} />
          {codeText(': ')}
          <PlaceholderWord variant="boolean" width={32} />
        </Component>
        <Component>{codeText('}')}</Component>
      </div>,
    ),
};
