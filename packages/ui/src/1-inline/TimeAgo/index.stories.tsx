import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {TimeAgo as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/TimeAgo',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {control: 'date'},
    short: {control: 'boolean'},
    live: {control: 'boolean'},
  },
};

export default meta;

const now = Date.now();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const Primary: StoryObj<typeof meta> = {
  args: {value: now - 5 * MINUTE},
};

export const Past: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={now - 2 * SECOND} />
      <Component value={now - 30 * SECOND} />
      <Component value={now - 5 * MINUTE} />
      <Component value={now - 90 * MINUTE} />
      <Component value={now - 5 * HOUR} />
      <Component value={now - 2 * DAY} />
      <Component value={now - 14 * DAY} />
      <Component value={now - 90 * DAY} />
      <Component value={now - 400 * DAY} />
    </div>
  ),
};

export const Future: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value={now + 30 * SECOND} />
      <Component value={now + 5 * MINUTE} />
      <Component value={now + 5 * HOUR} />
      <Component value={now + 3 * DAY} />
      <Component value={now + 90 * DAY} />
    </div>
  ),
};

export const Short: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component short value={now - 30 * SECOND} />
      <Component short value={now - 5 * MINUTE} />
      <Component short value={now - 5 * HOUR} />
      <Component short value={now - 2 * DAY} />
      <Component short value={now - 90 * DAY} />
      <Component short value={now - 400 * DAY} />
    </div>
  ),
};
