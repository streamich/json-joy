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
        ←
      </BasicButton>
      <BasicButton fill width="auto" compact>
        →
      </BasicButton>
    </Component>
  ),
};

export const ThreeButtons: StoryObj<typeof meta> = {
  render: () => (
    <Component>
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

export const TextButtons: StoryObj<typeof meta> = {
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

export const CustomGap: StoryObj<typeof meta> = {
  render: () => (
    <Component gap={-10}>
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

export const NoOverlap: StoryObj<typeof meta> = {
  render: () => (
    <Component gap={4}>
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
