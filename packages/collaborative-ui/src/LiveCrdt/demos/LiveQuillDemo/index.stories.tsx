import {LiveQuillDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof LiveQuillDemo> = {
  component: LiveQuillDemo,
  title: '<LiveCrdt>/<LiveQuillDemo>',
};

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const CustomId: StoryObj<typeof meta> = {
  args: {
    id: 'my-shared-doc',
  },
};
