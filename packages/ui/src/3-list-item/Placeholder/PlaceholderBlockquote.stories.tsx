import * as React from 'react';
import {PlaceholderBlockquote as Component} from './PlaceholderBlockquote';
import {PlaceholderWords} from './PlaceholderWords';
import {PlaceholderParagraph} from './PlaceholderParagraph';
import {PlaceholderCaret} from './PlaceholderCaret';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderBlockquote',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {color: {control: 'color'}},
};

export default meta;

const wrap = (children: React.ReactNode, w = '480px'): React.ReactElement => (
  <div style={{width: w, padding: '32px', fontSize: '20px', lineHeight: '32px'}}>{children}</div>
);

export const Basic: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component>
        <PlaceholderParagraph>
          <PlaceholderWords count={20} seed={3} />
        </PlaceholderParagraph>
      </Component>,
    ),
};

export const Accent: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component color="#985DF7" thickness={5}>
        <PlaceholderParagraph>
          <PlaceholderWords count={16} seed={9} />
        </PlaceholderParagraph>
      </Component>,
    ),
};

export const WithCaret: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <Component color="#5FCC8A">
        <PlaceholderParagraph>
          <PlaceholderWords count={12} seed={4} trailing />
          <PlaceholderCaret name="Monaco" color="#5FCC8A" height="20px" />
        </PlaceholderParagraph>
      </Component>,
    ),
};
