import * as React from 'react';
import {CollabIllustrationRichTextSmall as Component} from './RichTextSmall';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '5. Block/CollabIllustration/RichTextSmall',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const frame = (children: React.ReactNode, width = 280): React.ReactElement => (
  <div style={{width, background: '#fff', borderRadius: 14, border: '1px solid #EEF0F2'}}>{children}</div>
);

export const Default: StoryObj<typeof meta> = {
  render: () => frame(<Component />),
};

export const Bare: StoryObj<typeof meta> = {
  render: () => <Component style={{width: 280}} />,
};
