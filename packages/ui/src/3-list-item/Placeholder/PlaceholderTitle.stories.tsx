import * as React from 'react';
import {PlaceholderTitle as Component} from './PlaceholderTitle';
import {PlaceholderCaret} from './PlaceholderCaret';
import {PlaceholderWords} from './PlaceholderWords';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderTitle',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {
    level: {control: 'select', options: [1, 2, 3, 4]},
    color: {control: 'color'},
  },
};

export default meta;

const wrap = (children: React.ReactNode, w = '480px'): React.ReactElement => (
  <div style={{width: w, padding: '32px'}}>{children}</div>
);

export const H1: StoryObj<typeof meta> = {render: () => wrap(<Component level={1} />)};
export const H2: StoryObj<typeof meta> = {render: () => wrap(<Component level={2} />)};
export const H3: StoryObj<typeof meta> = {render: () => wrap(<Component level={3} />)};
export const H4: StoryObj<typeof meta> = {render: () => wrap(<Component level={4} />)};

export const Ladder: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <Component level={1} seed={1} />
        <Component level={2} seed={2} />
        <Component level={3} seed={3} />
        <Component level={4} seed={4} />
      </div>,
    ),
};

export const WithCaret: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component level={1}>
        <PlaceholderWords count={3} minWidth={60} maxWidth={150} height={28} trailing />
        <PlaceholderCaret name="Monaco" color="#5FCC8A" height="32px" />
      </Component>,
    ),
};
