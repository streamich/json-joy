import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {TypeBadge as Component} from '.';
import {Iconista} from '../../icons/Iconista';

const meta: Meta<typeof Component> = {
  title: '1. Inline/TypeBadge',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {control: 'inline-radio', options: ['square', 'plain']},
    size: {control: {type: 'range', min: 16, max: 64, step: 2}},
    label: {control: 'text'},
    color: {control: 'color'},
    background: {control: 'color'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    icon: <Iconista set="tabler" icon="file-text" width={20} height={20} />,
    label: 'Document',
  },
};

/** A rounded tile behind the icon (`square`) vs. the bare glyph (`plain`). */
export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Component
        variant="square"
        icon={<Iconista set="tabler" icon="file-text" width={20} height={20} />}
        label="Square"
      />
      <Component
        variant="plain"
        icon={<Iconista set="tabler" icon="file-text" width={20} height={20} />}
        label="Plain"
      />
    </div>
  ),
};

/** Just the badge, no label. */
export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <Component icon={<Iconista set="tabler" icon="folder" width={20} height={20} />} />
      <Component icon={<Iconista set="tabler" icon="photo" width={20} height={20} />} />
      <Component icon={<Iconista set="tabler" icon="code" width={20} height={20} />} />
    </div>
  ),
};

/** Sizes. */
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component
        size={24}
        icon={<Iconista set="tabler" color={'currentColor'} icon="file-text" width={16} height={16} />}
        label={'File'}
      />
      <Component
        size={36}
        icon={<Iconista set="tabler" color={'currentColor'} icon="file-text" width={24} height={24} />}
        label={'File'}
      />
      <Component
        size={48}
        icon={<Iconista set="tabler" color={'currentColor'} icon="file-text" width={24} height={24} />}
        label={'File'}
      />
    </div>
  ),
};

/** Tinted per type. */
export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component
        icon={<Iconista set="tabler" color={'currentColor'} icon="folder" width={20} height={20} />}
        label="Folder"
        color="#6c5ce7"
        background="#6c5ce722"
      />
      <Component
        icon={<Iconista set="tabler" color={'currentColor'} icon="photo" width={20} height={20} />}
        label="Image"
        color="#00b894"
        background="#00b89422"
      />
      <Component
        icon={<Iconista set="tabler" color={'currentColor'} icon="bug" width={20} height={20} />}
        label="Issue"
        color="#e17055"
        background="#e1705522"
      />
    </div>
  ),
};
