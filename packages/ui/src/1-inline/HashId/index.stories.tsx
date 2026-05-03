import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {HashId as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/HashId',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {control: 'text'},
    prefix: {control: {type: 'number'}},
    suffix: {control: {type: 'number'}},
    full: {control: 'boolean'},
  },
};

export default meta;

const sampleId = '0x9fA1b2C3d4E5f6789abcDEF0123456789ABCDEF0';
const sampleSha = 'a1b2c3d4e5f6789abcdef0123456789abcdef0123';
const sampleUuid = '550e8400-e29b-41d4-a716-446655440000';

export const Primary: StoryObj<typeof meta> = {
  args: {value: sampleSha},
};

export const Variants: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={sampleSha} />
      <Component value={sampleId} />
      <Component value={sampleUuid} />
      <Component value="abc123" />
      <Component value={sampleSha} prefix={4} suffix={4} />
      <Component value={sampleSha} prefix={10} suffix={6} />
      <Component value={sampleSha} full />
    </div>
  ),
};
