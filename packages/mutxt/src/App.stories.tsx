import {App} from './App';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof App> = {
  title: 'App',
  component: App,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {},
};
