import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {TechText as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/TechText',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  },
};

export const Url: StoryObj<typeof meta> = {
  args: {
    value: 'https://jsonjoy.com/specs/json-crdt',
  },
};

export const Values: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'}}>
      <Component value="f47ac10b-58cc-4372-a567-0e02b2c3d479" />
      <Component value="sha256:9f86d081884c7d659a2feaa0c55ad015" />
      <Component value="user@example.com" />
      <Component value="@streamich" />
      <Component value="https://jsonjoy.com/specs/json-crdt" />
      <Component value="/usr/local/bin/node" />
      <Component value="v2.11.0-rc.3" />
      <Component value="AKIAIOSFODNN7EXAMPLE" />
      <Component value="_d*p3q_F-AHd!bT" />
      <Component value="Привет-мир_2024" />
      <Component value="文件夹/图片-01.png" />
      <Component value="pаypal.com" />
    </div>
  ),
};

export const Ellipsis: StoryObj<typeof meta> = {
  render: () => (
    <div style={{width: 220, border: '1px dashed #ccc', padding: 8}}>
      <Component value="https://example.com/very/long/path/to/a/resource?query=string&more=params#fragment" />
    </div>
  ),
};
