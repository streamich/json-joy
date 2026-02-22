import * as React from 'react';
import {ClickCard as Component} from '.';
import {Iconista} from '../../icons/Iconista';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '4. Card/ClickCard',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    title: 'Hello World',
  },
};

export const Full: StoryObj<typeof meta> = {
  args: {
    title: 'Hello World',
    icon: <Iconista width={16} height={16} set={'ant_outline'} icon={'alert'} />,
    header: 'Stage 1',
    label: 'Library',
    children: 'This is a card, it is very nice. It has a lot of text. And it is very nice.',
  },
};

export const NoRotate: StoryObj<typeof meta> = {
  args: {
    title: 'Hello World',
    noRotate: true,
  },
};
