import * as React from 'react';
import {CommandPalette as Component} from '.';
import {CommandPaletteInput} from './CommandPaletteInput';
import {CommandPaletteItem} from './CommandPaletteItem';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '5. Block/CommandPalette',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    input: <CommandPaletteInput value={'Typ'} placeholder="Typeahead" onClear={() => {}} />,
    children: (
      <>
        <CommandPaletteItem>Item 1</CommandPaletteItem>
      </>
    ),
  },
};
