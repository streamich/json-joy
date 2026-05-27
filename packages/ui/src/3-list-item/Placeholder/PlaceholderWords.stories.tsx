import * as React from 'react';
import {PlaceholderWords as Component} from './PlaceholderWords';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderWords',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const wrap = (children: React.ReactNode, w = '420px'): React.ReactElement => (
  <div style={{width: w, padding: '32px', fontSize: '20px', lineHeight: '32px'}}>{children}</div>
);

export const Basic: StoryObj<typeof meta> = {render: () => wrap(<Component count={10} />)};
export const ManyWords: StoryObj<typeof meta> = {render: () => wrap(<Component count={40} />)};
export const Tight: StoryObj<typeof meta> = {
  render: () => wrap(<Component count={20} minWidth={16} maxWidth={50} height={8} />),
};
export const Tall: StoryObj<typeof meta> = {
  render: () => wrap(<Component count={10} minWidth={50} maxWidth={140} height={20} />),
};

export const SeedComparison: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Component count={12} seed={1} />
        <Component count={12} seed={2} />
        <Component count={12} seed={3} />
      </div>,
    ),
};
