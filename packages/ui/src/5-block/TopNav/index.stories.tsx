import * as React from 'react';
import {TopNav as Component} from '.';
import {HorizontalNav} from '../HorizontalNav';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '5. Block/TopNav',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    children: 'Children ...',
  },
};

export const WithNavAndScroll: StoryObj<typeof meta> = {
  args: {
    children: (
      <HorizontalNav
        items={[
          {node: 'Home', to: '/', active: true},
          {node: 'About', to: '/about'},
          {node: 'Contact', to: '/contact'},
        ]}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{height: '200vh'}}>
        <Story />
      </div>
    ),
  ],
};
