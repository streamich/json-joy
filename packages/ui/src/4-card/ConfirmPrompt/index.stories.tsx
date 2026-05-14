import * as React from 'react';
import {ConfirmPrompt as Component} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '4. Card/ConfirmPrompt',
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
    miniTitle: 'Confirm',
    title: 'Delete the whole document?',
    confirmLabel: 'Delete',
    children: 'The entire document is selected. This will remove all content.',
  },
};

export const PrimaryNoBorder: StoryObj<typeof meta> = {
  args: {
    miniTitle: 'Confirm',
    title: 'Delete the whole document?',
    confirmLabel: 'Delete',
    children: 'The entire document is selected. This will remove all content.',
    confirmProps: {border: false},
    cancelProps: {border: false},
  },
};

export const Replace: StoryObj<typeof meta> = {
  args: {
    miniTitle: 'Confirm',
    title: 'Replace the whole document?',
    confirmLabel: 'Replace',
    children: 'The entire document will be replaced with the pasted content.',
  },
};

export const NoMiniTitle: StoryObj<typeof meta> = {
  args: {
    title: 'Discard unsaved changes?',
    confirmLabel: 'Discard',
    children: 'Your edits since the last save will be lost.',
  },
};

export const CustomShortcuts: StoryObj<typeof meta> = {
  args: {
    miniTitle: 'Sign out',
    title: 'Sign out of this device?',
    confirmLabel: 'Sign out',
    cancelLabel: 'Stay',
    confirmShortcut: '⌘⏎',
    cancelShortcut: 'Esc',
    children: "You'll need to sign in again to use this device.",
  },
};

export const NoShortcuts: StoryObj<typeof meta> = {
  args: {
    miniTitle: 'Confirm',
    title: 'Delete this file?',
    confirmLabel: 'Delete',
    confirmShortcut: null,
    cancelShortcut: null,
    children: 'This action cannot be undone.',
  },
};

export const NoShortcutsNoBorder: StoryObj<typeof meta> = {
  args: {
    miniTitle: 'Confirm',
    title: 'Delete this file?',
    confirmLabel: 'Delete',
    confirmShortcut: null,
    cancelShortcut: null,
    children: 'This action cannot be undone.',
    confirmProps: {border: false},
    cancelProps: {border: false},
  },
};
