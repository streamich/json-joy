import * as React from 'react';
import {Menu as Component} from '.';
import {Code} from '../../1-inline/Code';
import {Iconista} from '../../icons/Iconista';
import {MenuItem} from './MenuItem';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Component> = {
  title: '4. Card/Menu',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story) => (
      <div style={{width: 270}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    items: [
      {
        key: '1',
        menuItem: 'Components',
        activeChild: true,
        to: '/components',
        children: [
          {
            key: '0',
            menuItem: 'Introduction',
            to: '/components/intro',
          },
          {
            key: '1',
            menuItem: 'Inline components',
            activeChild: true,
            to: '/components/inline',
            children: [
              {
                key: '1',
                to: '/components/inline/avatar',
                menuItem: (
                  <>
                    <Code gray spacious size={1}>
                      {'<Avatar>'}
                    </Code>
                    &nbsp;component
                  </>
                ),
              },
              {
                key: '2',
                active: true,
                activeChild: true,
                to: '/components/inline/code',
                menuItem: (
                  <>
                    <Code gray spacious size={1}>
                      {'<Text>'}
                    </Code>
                    &nbsp;component
                  </>
                ),
              },
              {
                key: '3',
                to: '/components/inline/code',
                menuItem: (
                  <>
                    <Code gray spacious size={1}>
                      {'<Code>'}
                    </Code>
                    &nbsp;component
                  </>
                ),
              },
            ],
          },
          {
            key: '2',
            menuItem: 'Block components',
            to: '/components/block',
            hasMore: true,
          },
          {
            key: '2',
            menuItem: 'Page components',
            to: '/components/page',
            hasMore: true,
          },
        ],
      },
      {
        key: '2',
        menuItem: 'Design',
      },
      {
        key: '3',
        menuItem: 'Appendix',
      },
    ],
  },
};

export const WithIcons: StoryObj<typeof meta> = {
  args: {
    items: [
      {
        key: 'about',
        menuItem: 'About Us',
        active: true,
        icon: <Iconista set="elastic" icon="beaker" width={16} height={16} />,
        to: 'http://google.com',
      },
      {
        key: 'recent',
        menuItem: 'Recent',
        icon: <Iconista set="ant_outline" icon="user" width={16} height={16} />,
        onClick: () => {},
      },
      {
        key: 'starred',
        menuItem: 'Starred',
        onClick: () => {},
      },
    ],
  },
};

export const SubMenu: StoryObj<typeof meta> = {
  args: {
    items: [
      {
        key: 'about',
        menuItem: 'About Us',
        activeChild: true,
        active: true,
        icon: <Iconista set="elastic" icon="beaker" width={16} height={16} />,
        to: 'http://google.com',
        children: [
          {
            key: 'about-us',
            menuItem: 'About us',
            onClick: () => {},
          },
          {
            key: 'about-them',
            menuItem: 'About them',
            onClick: () => {},
          },
        ],
      },
      {
        key: 'recent',
        menuItem: 'Recent',
        icon: <Iconista set="ant_outline" icon="user" width={16} height={16} />,
        onClick: () => {},
        children: [
          {
            key: 'about-us',
            menuItem: 'About us',
            onClick: () => {},
          },
          {
            key: 'about-them',
            menuItem: 'About them',
            onClick: () => {},
          },
        ],
      },
      {
        key: 'starred',
        menuItem: 'Starred',
        onClick: () => {},
      },
    ],
  },
};

export const SubSubMenu: StoryObj<typeof meta> = {
  args: {
    items: [
      {
        key: 'about',
        menuItem: 'About Us',
        activeChild: true,
        icon: <Iconista set="elastic" icon="beaker" width={16} height={16} />,
        to: 'http://google.com',
        children: [
          {
            key: 'about-us',
            menuItem: 'About us',
            activeChild: true,
            onClick: () => {},
            children: [
              {
                key: 'about-them',
                menuItem: 'About them',
                active: true,
                onClick: () => {},
              },
            ],
          },
        ],
      },
      {
        key: 'recent',
        menuItem: 'Recent',
        icon: <Iconista set="ant_outline" icon="user" width={16} height={16} />,
        onClick: () => {},
      },
      {
        key: 'starred',
        menuItem: 'Starred',
        onClick: () => {},
      },
    ],
  },
};

export const ItemsStandalone: StoryObj<typeof meta> = {
  render: () => (
    <div style={{padding: 32}}>
      <MenuItem to="http://google.com" active>
        <Iconista set="elastic" icon="beaker" width={16} height={16} />
        <div style={{marginLeft: 4}}>About Us</div>
      </MenuItem>
      <MenuItem onClick={() => {}}>
        <Iconista set="ant_outline" icon="user" width={16} height={16} />
        <div style={{marginLeft: 4}}>Recent</div>
      </MenuItem>
      <MenuItem onClick={() => {}}>Starred</MenuItem>
    </div>
  ),
};
