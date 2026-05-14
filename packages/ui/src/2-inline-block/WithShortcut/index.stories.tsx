import * as React from 'react';
import {WithShortcut as Component} from '.';
import {BasicButton} from '../BasicButton';
import {Button} from '../Button';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/WithShortcut',
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
    shortcut: 'Enter',
    children: (
      <BasicButton type="button" width="auto" height={32} border>
        Save
      </BasicButton>
    ),
  },
};

export const Escape: StoryObj<typeof meta> = {
  args: {
    shortcut: 'Esc',
    children: (
      <BasicButton type="button" width="auto" height={32} border>
        Cancel
      </BasicButton>
    ),
  },
};

export const LargeChip: StoryObj<typeof meta> = {
  args: {
    shortcut: '⌘K',
    small: false,
    children: (
      <BasicButton type="button" width="auto" height={32} border>
        Command palette
      </BasicButton>
    ),
  },
};

export const Hidden: StoryObj<typeof meta> = {
  args: {
    shortcut: 'Enter',
    hidden: true,
    children: (
      <BasicButton type="button" width="auto" height={32} border>
        Save
      </BasicButton>
    ),
  },
};

export const ButtonPair: StoryObj<typeof meta> = {
  render: () => (
    <div style={{display: 'flex', gap: 12}}>
      <Component shortcut="Esc">
        <BasicButton type="button" width="auto" height={32} border>
          Cancel
        </BasicButton>
      </Component>
      <Component shortcut="Enter">
        <BasicButton type="button" width="auto" height={32} border positive>
          Confirm
        </BasicButton>
      </Component>
    </div>
  ),
};

export const FilledButton: StoryObj<typeof meta> = {
  render: () => (
    <Component shortcut="⌘S">
      <Button>Save document</Button>
    </Component>
  ),
};
