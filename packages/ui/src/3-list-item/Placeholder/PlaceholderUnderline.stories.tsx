import * as React from 'react';
import {PlaceholderUnderline as Component} from './PlaceholderUnderline';
import {PlaceholderWords} from './PlaceholderWords';
import {PlaceholderParagraph} from './PlaceholderParagraph';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderUnderline',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {
    color: {control: 'color'},
    variant: {control: 'select', options: ['solid', 'dashed', 'dotted']},
  },
};

export default meta;

const wrap = (children: React.ReactNode, w = '480px'): React.ReactElement => (
  <div style={{width: w, padding: '32px', fontSize: '20px', lineHeight: '32px'}}>{children}</div>
);

export const Solid: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        <PlaceholderWords count={3} trailing />
        <Component color="#58B9F8">
          <PlaceholderWords count={2} seed={4} />
        </Component>{' '}
        <PlaceholderWords count={4} seed={6} />
      </PlaceholderParagraph>,
    ),
};

export const Dashed: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        <PlaceholderWords count={3} trailing />
        <Component color="#E44A28" variant="dashed">
          <PlaceholderWords count={2} seed={4} />
        </Component>{' '}
        <PlaceholderWords count={4} seed={6} />
      </PlaceholderParagraph>,
    ),
};

export const Dotted: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        <PlaceholderWords count={3} trailing />
        <Component color="#F6A832" variant="dotted">
          <PlaceholderWords count={2} seed={4} />
        </Component>{' '}
        <PlaceholderWords count={4} seed={6} />
      </PlaceholderParagraph>,
    ),
};

export const WithText: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <PlaceholderParagraph>
        See the <Component color="#58B9F8">documentation page</Component> for more details.
      </PlaceholderParagraph>,
    ),
};
