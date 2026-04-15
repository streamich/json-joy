import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {FileTabs} from '.';
import {FileIcon} from '../../1-inline/FileIcon';

const meta: Meta<typeof FileTabs> = {
  title: '3. List Item/FileTabs',
  component: FileTabs,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};
export default meta;

const wrap = (w: number) => (Story: React.ComponentType) => (
  <div style={{width: w, minWidth: 0}}>
    <Story />
  </div>
);

const tabs1 = [
  {
    id: 'file1',
    name: 'index asdf.ts',
    icon: () => <FileIcon label="ts" size={16} />,
  },
  {
    id: 'file2',
    name: 'a-very-long-file-name.js',
    icon: () => <FileIcon label="js" size={16} />,
  },
  {
    id: 'file3',
    name: 'File 3',
    deletable: false,
  },
  {
    id: 'file4',
    name: 'File 4',
  },
];

let cnt = 4;

export const Primary: StoryObj<typeof meta> = {
  args: {
    // bg: '#30191e',
    bg: '#ffd9df',
    render: (tab) => <div style={{height: 8}} />,
    tabs: tabs1,
    addNewTab: () => {
      cnt += 1;
      return {
        id: `file${cnt}`,
        name: `New File ${cnt}`,
      };
    },
  },
  decorators: [wrap(700)],
};

export const Dark: StoryObj<typeof meta> = {
  args: {
    bg: '#30191e',
    render: (tab) => <div style={{height: 8}} />,
    // render: (tab) => <div style={{padding: 16}}>Content of {tab.name}</div>,
    tabs: tabs1,
  },
  decorators: [wrap(700)],
};
