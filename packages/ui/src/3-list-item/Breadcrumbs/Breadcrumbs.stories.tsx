import * as React from 'react';
import {Breadcrumbs as Component, Breadcrumb} from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '3. List item/Breadcrumbs',
  component: Component,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    crumbs: [
      <Breadcrumb key={1} to="/home">
        Home
      </Breadcrumb>,
      <Breadcrumb key={2} to="/products">
        Products
      </Breadcrumb>,
      <Breadcrumb key={3} to="/category">
        Category
      </Breadcrumb>,
      <Breadcrumb key={4} to="/product">
        Product
      </Breadcrumb>,
    ],
  },
};
