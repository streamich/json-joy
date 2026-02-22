import * as React from 'react';
import {FontStyleButton} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof FontStyleButton> = {
  title: '2. Inline Block/FontStyleButton',
  component: FontStyleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// export const Sans: StoryObj<typeof meta> = {
//   args: {
//     kind: 'sans',
//   },
// };

// export const Serif: StoryObj<typeof meta> = {
//   args: {
//     kind: 'serif',
//   },
// };

// export const Slab: StoryObj<typeof meta> = {
//   args: {
//     kind: 'slab',
//   },
// };

// export const Mono: StoryObj<typeof meta> = {
//   args: {
//     kind: 'mono',
//   },
// };

export const All: StoryObj<typeof meta> = {
  render: () => (
    <div style={{width: 140, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: '16px'}}>
      <FontStyleButton kind="sans" />
      <FontStyleButton kind="serif" active />
      <FontStyleButton kind="slab" />
      <FontStyleButton kind="mono" />
    </div>
  ),
};
