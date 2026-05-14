import * as React from 'react';
import {ArgNum, type ArgNumProps} from './ArgNum';
import {ContextPane} from '../../ContextPane';
import {ContextSep} from '../../ContextSep';
import {Iconista} from '../../../../icons/Iconista';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/ContextMenu/ArgsPane/ArgNum',
  component: ArgNum,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

const decorators = [
  (Story: any) => (
    <ContextPane>
      <ContextSep />
      <Story />
      <ContextSep />
    </ContextPane>
  ),
];

export const Required: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'url',
      name: 'Link',
      optional: false,
      placeholder: 'https://example.com',
    },
    value: 0,
  },
};

export const Optional: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'note',
      name: 'Note',
      optional: true,
      placeholder: 'Optional note…',
    },
    value: 0,
  },
};

export const Compact: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'fontSize',
      name: 'Text size',
      min: 6,
      max: 72,
      icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
    },
    value: 16,
    compact: true,
  },
};

export const CompactNoIcon: StoryObj<ArgNumProps> = {
  decorators,
  args: {
    param: {
      kind: 'num',
      id: 'lineHeight',
      name: 'Line height',
      min: 1,
      max: 3,
      step: 0.1,
    },
    value: 1.5,
    compact: true,
  },
};
