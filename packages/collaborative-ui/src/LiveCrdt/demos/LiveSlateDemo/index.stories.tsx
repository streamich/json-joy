import {LiveSlateDemo} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof LiveSlateDemo> = {
  component: LiveSlateDemo,
  title: '<LiveCrdt>/<LiveSlateDemo>',
};

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const CustomId: StoryObj<typeof meta> = {
  args: {
    id: 'my-shared-slate-doc',
  },
};
