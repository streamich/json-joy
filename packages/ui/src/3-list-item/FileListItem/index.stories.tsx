import * as React from 'react';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {FileListItem as Component} from '.';
import {Iconista} from '../../icons/Iconista';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const FileIcon: React.FC = () => (
  <Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} />
);

const ActionButtons: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
    <BasicButtonClose size={28} rounder noOutline title="Close" />
    <BasicButtonMore size={28} rounder noOutline title="More actions" />
  </div>
);

const meta: Meta<typeof Component> = {
  title: '3. List item/FileListItem',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {control: false},
    actions: {control: false},
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    title: 'file.json',
    metadata: 'Object (2 keys) - 5 days ago',
    onClick: () => {},
    icon: <FileIcon />,
    actions: <ActionButtons />,
  },
  render: (args) => (
    <div style={{width: 440}}>
      <Component {...args} />
    </div>
  ),
};

export const Selected: StoryObj<typeof meta> = {
  args: {
    ...Primary.args,
    selected: true,
  },
  render: Primary.render,
};

export const ButtonAction: StoryObj<typeof meta> = {
  args: {
    title: 'schema.ts',
    metadata: 'TypeScript source - updated 14 minutes ago',
    icon: <FileIcon />,
    actions: <ActionButtons />,
    onClick: () => {},
  },
  render: Primary.render,
};

export const Loading: StoryObj<typeof meta> = {
  args: {
    title: 'sync-report.json',
    metadata: 'Uploading metadata...',
    loading: true,
    actions: <ActionButtons />,
  },
  render: Primary.render,
};

export const States: StoryObj<typeof meta> = {
  render: () => (
    <div style={{width: 440, display: 'grid', gap: 8}}>
      <Component
        title="file.json"
        metadata="Object (2 keys) - 5 days ago"
        to="/files/file.json"
        icon={<FileIcon />}
        actions={<ActionButtons />}
      />
      <Component
        title="design-notes.md"
        metadata="Markdown document · viewed just now"
        selected
        to="/files/design-notes.md"
        icon={<FileIcon />}
        actions={<ActionButtons />}
      />
      <Component
        title="archived.dump"
        metadata="Binary snapshot · read-only"
        disabled
        icon={<FileIcon />}
        actions={<ActionButtons />}
      />
      <Component
        title="pending-export.json"
        metadata="Preparing download..."
        loading
        actions={<ActionButtons />}
      />
    </div>
  ),
};