import type {Meta, StoryObj} from '@storybook/react';
import {JsonAtom as Component} from '.';

const meta: Meta<typeof Text> = {
  title: 'JsonAtom',
  component: Component as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const String: StoryObj<typeof meta> = {
  args: {
    value: 'Hello World',
  } as any,
};

export const Number: StoryObj<typeof meta> = {
  args: {
    value: 123,
  } as any,
};

export const NegativeNumber: StoryObj<typeof meta> = {
  args: {
    value: -25,
  } as any,
};

export const Float: StoryObj<typeof meta> = {
  args: {
    value: 3.14,
  } as any,
};

export const NegativeFloat: StoryObj<typeof meta> = {
  args: {
    value: -2.1589345934,
  } as any,
};

export const Zero: StoryObj<typeof meta> = {
  args: {
    value: 0,
  } as any,
};

export const Null: StoryObj<typeof meta> = {
  args: {
    value: null,
  } as any,
};

export const Undefined: StoryObj<typeof meta> = {
  args: {
    value: undefined,
  } as any,
};

export const True: StoryObj<typeof meta> = {
  args: {
    value: true,
  } as any,
};

export const False: StoryObj<typeof meta> = {
  args: {
    value: false,
  } as any,
};

export const Array: StoryObj<typeof meta> = {
  args: {
    value: [],
  } as any,
};

export const Object: StoryObj<typeof meta> = {
  args: {
    value: {},
  } as any,
};

export const Binary: StoryObj<typeof meta> = {
  args: {
    value: new Uint8Array([1, 2, 3, 4, 14, 15, 16, 17, 256, 34, 127, 128]),
  } as any,
};
