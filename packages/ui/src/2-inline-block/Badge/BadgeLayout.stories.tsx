import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Avatar} from '../../1-inline/Avatar';
import {BadgeLayout as Component} from './BadgeLayout';
import {BadgeRight} from './BadgeRight';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Badge/BadgeLayout',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `BadgeLayout` is the low-level flex row that places an `icon` next to
 * arbitrary `children`. Composing it with `Avatar` + `BadgeRight` reproduces
 * what `Badge` renders.
 */
export const Default: Story = {
  args: {
    icon: <Avatar name="Ada Lovelace" />,
    children: <BadgeRight name="Ada Lovelace" subtext="ada@example.com" />,
  },
};

export const EmojiIcon: Story = {
  args: {
    icon: <Avatar emoji="📁" />,
    children: <BadgeRight name="Documents" subtext="128 items" />,
  },
};

export const NameOnly: Story = {
  args: {
    icon: <Avatar name="Grace Hopper" />,
    children: <BadgeRight name="Grace Hopper" />,
  },
};

export const CustomChildren: Story = {
  args: {
    icon: <Avatar emoji="⭐" />,
    children: <span style={{alignSelf: 'center', paddingLeft: 8}}>Any content can sit next to the icon</span>,
  },
};

export const Clickable: Story = {
  args: {
    icon: <Avatar name="Click me" />,
    children: <BadgeRight name="Click me" subtext="the whole row handles clicks" />,
    onClick: () => {},
  },
};
