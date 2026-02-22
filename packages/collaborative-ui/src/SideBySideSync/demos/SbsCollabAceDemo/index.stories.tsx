import {SbsCollabAceDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof SbsCollabAceDemo> = {
  component: SbsCollabAceDemo,
  title: '<SideBySideSync>/<SbsCollabAceDemo>',
};

export default meta;

export const AceEditor: StoryObj<typeof meta> = {};
