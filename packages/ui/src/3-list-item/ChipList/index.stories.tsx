import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Avatar} from '../../1-inline/Avatar';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import {Iconista} from '../../icons/Iconista';
import {ChipList as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '3. List Item/ChipList',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const person = (name: string): MenuItem => ({
  id: name.toLowerCase(),
  name,
  icon: () => <Iconista width={15} height={15} set="tabler" icon={'user' as never} />,
});

const labels: MenuItem[] = [
  {id: 'bug', name: 'Bug', color: '#e5484d'},
  {id: 'feature', name: 'Feature', color: '#30a46c'},
  {id: 'ux', name: 'UX', color: '#0091ff'},
  {id: 'docs', name: 'Docs', color: '#f76b15'},
];

export const Colors: StoryObj<typeof meta> = {
  args: {items: labels},
};

export const WithIcons: StoryObj<typeof meta> = {
  args: {items: [person('Alice'), person('Bob'), person('Carol')]},
};

const withAvatar = (name: string): MenuItem => ({
  id: name.toLowerCase(),
  name,
  icon: () => <Avatar name={name} width={16} />,
});

export const Avatars: StoryObj<typeof meta> = {
  args: {items: ['Alice', 'Bob', 'Carol', 'Dave'].map(withAvatar)},
};

export const Overflow: StoryObj<typeof meta> = {
  args: {items: labels, max: 2},
};

export const Removable: StoryObj<typeof meta> = {
  render: () => <Component items={labels} onRemove={(id) => console.log('remove', id)} />,
};
