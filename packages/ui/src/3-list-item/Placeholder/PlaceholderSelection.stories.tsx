import * as React from 'react';
import {PlaceholderSelection as Component} from './PlaceholderSelection';
import {PlaceholderWords} from './PlaceholderWords';
import {PlaceholderCaret} from './PlaceholderCaret';
import {PlaceholderParagraph} from './PlaceholderParagraph';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderSelection',
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
      <PlaceholderParagraph>
        <PlaceholderWords count={5} trailing />
        <Component color="#985DF7">
          <PlaceholderWords count={3} seed={5} trailing />
        </Component>{' '}
        <PlaceholderWords count={4} seed={9} />
      </PlaceholderParagraph>,
    ),
};

export const WithCaret: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        <PlaceholderWords count={4} trailing />
        <Component color="#5FCC8A">
          <PlaceholderWords count={3} seed={3} trailing />
          <PlaceholderCaret name="Monaco" color="#5FCC8A" height="24px" />
        </Component>{' '}
        <PlaceholderWords count={5} seed={7} />
      </PlaceholderParagraph>,
    ),
};

export const WithText: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        Hello <Component color="#58B9F8">world is a fine</Component> place.
      </PlaceholderParagraph>,
    ),
};

export const Colors: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <PlaceholderParagraph>
          <Component color="#5FCC8A">
            <PlaceholderWords count={4} />
          </Component>
        </PlaceholderParagraph>
        <PlaceholderParagraph>
          <Component color="#985DF7">
            <PlaceholderWords count={4} seed={2} />
          </Component>
        </PlaceholderParagraph>
        <PlaceholderParagraph>
          <Component color="#58B9F8">
            <PlaceholderWords count={4} seed={3} />
          </Component>
        </PlaceholderParagraph>
        <PlaceholderParagraph>
          <Component color="#F6A832">
            <PlaceholderWords count={4} seed={4} />
          </Component>
        </PlaceholderParagraph>
      </div>,
    ),
};

export const WrapsAcrossLines: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        <PlaceholderWords count={6} trailing />
        <Component color="#985DF7">
          <PlaceholderWords count={20} seed={4} />
        </Component>{' '}
        <PlaceholderWords count={6} seed={6} />
      </PlaceholderParagraph>,
      '380px',
    ),
};
