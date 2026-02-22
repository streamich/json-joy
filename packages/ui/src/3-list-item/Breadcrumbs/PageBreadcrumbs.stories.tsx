// import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {PageBreadcrumbs as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '3. List item/Breadcrumbs/PageBreadcrumbs',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    page: {
      name: 'Page',
      title: 'Page',
      slug: 'page',
      to: '/page',
      children: [
        {
          name: 'Child',
          title: 'Child',
          slug: 'child',
          to: '/page/child',
          children: [
            {
              name: 'Grandchild',
              title: 'Grandchild',
              slug: 'grandchild',
              to: '/page/child/grandchild',
            },
          ],
        },
      ],
    },
    steps: ['child', 'grandchild'],
  },
};
