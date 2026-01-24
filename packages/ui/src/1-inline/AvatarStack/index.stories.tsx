import * as React from 'react';
import {AvatarStack as Component} from '.';
import {Avatar} from '../Avatar';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '1. Inline/AvatarStack',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const NegativeGap: StoryObj<typeof meta> = {
  render: () => (
    <Component gap={-10}>
      <Avatar name="Agata" />
      <Avatar name="Borelius" />
      <Avatar name="Tester" />
    </Component>
  ),
};

export const ZeroGap: StoryObj<typeof meta> = {
  render: () => (
    <Component gap={0}>
      <Avatar name="Agata" />
      <Avatar name="Borelius" />
      <Avatar name="Tester" />
    </Component>
  ),
};

export const PositiveGap: StoryObj<typeof meta> = {
  render: () => (
    <Component gap={10}>
      <Avatar name="Agata" />
      <Avatar name="Borelius" />
      <Avatar name="Tester" />
    </Component>
  ),
};
