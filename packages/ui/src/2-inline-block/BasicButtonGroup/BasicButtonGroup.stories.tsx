import * as React from 'react';
import {BasicButtonGroup as Component} from '.';
import {BasicButton} from '../BasicButton';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/BasicButtonGroup',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Component>
      <BasicButton fill width="auto" compact>
        First
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Second
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Third
      </BasicButton>
    </Component>
  ),
};

export const WithDividers: StoryObj<typeof meta> = {
  render: () => (
    <Component dividers>
      <BasicButton fill width="auto" compact>
        First
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Second
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Third
      </BasicButton>
    </Component>
  ),
};

export const NavigationButtons: StoryObj<typeof meta> = {
  render: () => (
    <Component radius={6}>
      <BasicButton fill width="auto" compact>
        ◀
      </BasicButton>
      <BasicButton fill width="auto" compact>
        ▶
      </BasicButton>
    </Component>
  ),
};

export const ArrowButtonsWithDividers: StoryObj<typeof meta> = {
  render: () => (
    <Component radius={6} dividers>
      <BasicButton fill width="auto" compact>
        ←
      </BasicButton>
      <BasicButton fill width="auto" compact>
        ↔
      </BasicButton>
      <BasicButton fill width="auto" compact>
        →
      </BasicButton>
    </Component>
  ),
};

export const WithGap: StoryObj<typeof meta> = {
  render: () => (
    <Component connected={false} gap={4}>
      <BasicButton fill width="auto" compact>
        A
      </BasicButton>
      <BasicButton fill width="auto" compact>
        B
      </BasicButton>
      <BasicButton fill width="auto" compact>
        C
      </BasicButton>
    </Component>
  ),
};

export const Stretched: StoryObj<typeof meta> = {
  render: () => (
    <div style={{width: 300}}>
      <Component stretch>
        <BasicButton fill width="auto" compact>
          Left
        </BasicButton>
        <BasicButton fill width="auto" compact>
          Center
        </BasicButton>
        <BasicButton fill width="auto" compact>
          Right
        </BasicButton>
      </Component>
    </div>
  ),
};

export const StretchedWithDividers: StoryObj<typeof meta> = {
  render: () => (
    <div style={{width: 300}}>
      <Component stretch dividers>
        <BasicButton fill width="auto" compact>
          Left
        </BasicButton>
        <BasicButton fill width="auto" compact>
          Center
        </BasicButton>
        <BasicButton fill width="auto" compact>
          Right
        </BasicButton>
      </Component>
    </div>
  ),
};

export const LargeRadius: StoryObj<typeof meta> = {
  render: () => (
    <Component radius={16}>
      <BasicButton fill width="auto" compact>
        Option A
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Option B
      </BasicButton>
      <BasicButton fill width="auto" compact>
        Option C
      </BasicButton>
    </Component>
  ),
};

export const TwoButtons: StoryObj<typeof meta> = {
  render: () => (
    <Component dividers>
      <BasicButton fill width="auto" compact>
        Yes
      </BasicButton>
      <BasicButton fill width="auto" compact>
        No
      </BasicButton>
    </Component>
  ),
};

export const WithBorder: StoryObj<typeof meta> = {
  render: () => (
    <Component radius={6}>
      <BasicButton fill width="auto" compact border>
        Edit
      </BasicButton>
      <BasicButton fill width="auto" compact border>
        Delete
      </BasicButton>
    </Component>
  ),
};
