import * as React from 'react';
import {SubNav as Component} from '.';
import {TopNav} from '../TopNav';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '5. Block/SubNav',
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

export const WithTopNav: StoryObj<typeof meta> = {
  args: {
    children: 'SubNav content ...',
    right: 'Right content ...',
    backTo: '/back/to/here',
    // noBorder: true,
  },
  decorators: [
    (Story) => (
      <>
        <TopNav>TopNav</TopNav>
        {Story()}
        <div style={{height: '200vh'}} />
      </>
    ),
  ],
};
