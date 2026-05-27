import * as React from 'react';
import {PlaceholderWord as Component} from './PlaceholderWord';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '3. List Item/Placeholder/PlaceholderWord',
  component: Component,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'string', 'number', 'boolean', 'null', 'key', 'bold'],
    },
    color: {control: 'color'},
  },
};

export default meta;

const wrap = (children: React.ReactNode): React.ReactElement => <div style={{padding: '32px'}}>{children}</div>;

export const Default: StoryObj<typeof meta> = {render: () => wrap(<Component />)};
export const Wide: StoryObj<typeof meta> = {render: () => wrap(<Component width={160} />)};
export const Tall: StoryObj<typeof meta> = {render: () => wrap(<Component height={24} width={120} />)};
export const Italic: StoryObj<typeof meta> = {render: () => wrap(<Component italic width={80} />)};
export const CustomColor: StoryObj<typeof meta> = {render: () => wrap(<Component color="#5FCC8A" width={80} />)};

export const Variants: StoryObj<typeof meta> = {
  render: () =>
    wrap(
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <Component variant="default" width={60} />
        <Component variant="key" width={50} />
        <Component variant="string" width={80} />
        <Component variant="number" width={40} />
        <Component variant="boolean" width={36} />
        <Component variant="null" width={36} />
        <Component variant="bold" width={70} />
      </div>,
    ),
};
