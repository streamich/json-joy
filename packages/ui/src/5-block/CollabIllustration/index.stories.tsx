import * as React from 'react';
import {CollabIllustrationPlainText} from './PlainText';
import {CollabIllustrationRichText} from './RichText';
import {CollabIllustrationJson} from './Json';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '5. Block/CollabIllustration',
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const frame = (children: React.ReactNode, width = 520): React.ReactElement => (
  <div style={{width, background: '#fff', borderRadius: 14, border: '1px solid #EEF0F2'}}>{children}</div>
);

export const PlainText: StoryObj<typeof meta> = {
  render: () => frame(<CollabIllustrationPlainText />),
};

export const RichText: StoryObj<typeof meta> = {
  render: () => frame(<CollabIllustrationRichText />),
};

export const Json: StoryObj<typeof meta> = {
  render: () => frame(<CollabIllustrationJson />),
};

export const Trio: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32, padding: 16, background: '#F6F7F8'}}>
      {frame(<CollabIllustrationPlainText />)}
      {frame(<CollabIllustrationRichText />)}
      {frame(<CollabIllustrationJson />)}
    </div>
  ),
};
