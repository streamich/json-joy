import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {DateTime as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/DateTime',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {control: 'date'},
    timeOnly: {control: 'boolean'},
    dateOnly: {control: 'boolean'},
    seconds: {control: 'boolean'},
    long: {control: 'boolean'},
  },
};

export default meta;

const sample = new Date('2026-05-03T13:10:27Z').getTime();

export const Primary: StoryObj<typeof meta> = {
  args: {value: sample},
};

export const WithSeconds: StoryObj<typeof meta> = {
  args: {value: sample, seconds: true},
};

export const LongMonth: StoryObj<typeof meta> = {
  args: {value: sample, long: true},
};

export const DateOnly: StoryObj<typeof meta> = {
  args: {value: sample, dateOnly: true},
};

export const TimeOnly: StoryObj<typeof meta> = {
  args: {value: sample, timeOnly: true},
};

export const Variations: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Component value={sample} />
      <Component value={sample} seconds />
      <Component value={sample} long />
      <Component value={sample} long seconds />
      <Component value={sample} dateOnly />
      <Component value={sample} timeOnly />
    </div>
  ),
};
