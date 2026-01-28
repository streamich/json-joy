import {SbsCollabInputDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof SbsCollabInputDemo> = {
  component: SbsCollabInputDemo,
  title: '<SideBySideSync>/<SbsCollabInputDemo>',
};

export default meta;

export const Input: StoryObj<typeof meta> = {};

export const Textarea: StoryObj<typeof meta> = {
  args: { multiline: true}
};
