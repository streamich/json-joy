import * as React from 'react';
import {ToolbarPane} from './ToolbarPane';
import {ToolbarItem} from './ToolbarItem';
import {Iconista} from '../../icons/Iconista';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ToolbarPane> = {
  title: '4. Card/Toolbar/ToolbarPane',
  component: ToolbarPane,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: (
      <>
        <ToolbarItem>
          <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />
        </ToolbarItem>
      </>
    ),
  },
};

export const Accent: StoryObj<typeof meta> = {
  args: {
    accent: 'pink',
    children: (
      <>
        <ToolbarItem>
          <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />
        </ToolbarItem>
      </>
    ),
  },
};
