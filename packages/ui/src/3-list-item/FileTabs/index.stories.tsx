import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {FileTabs} from '.';
import {FileIcon} from '../../1-inline/FileIcon';
import {Avatar} from '../../1-inline/Avatar';
import {val} from '../../utils/rsync';

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
    disabled: val(true),
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

// Many items
const tabs2 = [
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
    id: 'user1',
    name: 'user1.json',
    icon: () => <Avatar width={16} name={'u1'} />,
  },
  {
    id: 'user2',
    name: 'user2.json',
    icon: () => <Avatar width={16} name={'u2'} />,
  },
  {
    id: 'file4',
    name: 'File 4',
  },
  {
    id: 'package.json',
    name: 'package.json',
    icon: () => <FileIcon label="json" size={16} />,
  },
  {
    id: 'readme.md',
    name: 'readme.md',
    icon: () => <FileIcon label="md" size={16} />,
  },
  {
    id: 'ignore',
    name: '.ignore',
    icon: () => <FileIcon label="txt" size={16} />,
  },
  {
    id: 'license',
    name: 'LICENSE',
    icon: () => <FileIcon label="txt" size={16} />,
  },
  {
    id: 'config',
    name: 'config',
    icon: () => <FileIcon label="cfg" size={16} />,
  },
];

let cnt = 5;

const addNewTab = () => {
  const num = cnt++;
  return {
    id: `file${num}`,
    name: `New File ${num}`,
    icon: () => <FileIcon label={'f' + num} size={16} />,
  };
};

export const Primary: StoryObj<typeof meta> = {
  args: {
    // bg: '#30191e',
    bg: '#ffd9df',
    render: (tab) => <div style={{height: 8}} />,
    tabs: tabs1,
    addNewTab,
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

export const ManyItems: StoryObj<typeof meta> = {
  args: {
    bg: '#c8e7f3',
    render: (tab) => <div style={{height: 8}} />,
    // render: (tab) => <div style={{padding: 16}}>Content of {tab.name}</div>,
    tabs: tabs2,
    addNewTab,
  },
  decorators: [wrap(400)],
};

export const WithAfterAndRight: StoryObj<typeof meta> = {
  args: {
    bg: '#ffd9df',
    render: () => <div style={{height: 8}} />,
    tabs: tabs1,
    addNewTab,
    before: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 24,
          padding: '0 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,.4)',
          fontSize: 12,
          color: 'rgba(0,0,0,.65)',
          whiteSpace: 'nowrap',
        }}
      >
        project
      </div>
    ),
    after: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 24,
          padding: '0 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,.55)',
          fontSize: 12,
          color: 'rgba(0,0,0,.65)',
          whiteSpace: 'nowrap',
        }}
      >
        2 unsaved
      </div>
    ),
    right: (
      <div style={{display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'}}>
        <span style={{fontSize: 12, color: 'rgba(0,0,0,.6)'}}>workspace</span>
        <Avatar width={20} name={'ws'} />
      </div>
    ),
  },
  decorators: [wrap(700)],
};

const tabsWithTooltips = [
  {
    id: 'main',
    name: 'main.ts',
    icon: () => <FileIcon label="ts" size={16} />,
    description: 'Application entry point. Bootstraps the React tree and global providers.',
  },
  {
    id: 'store',
    name: 'store.ts',
    icon: () => <FileIcon label="ts" size={16} />,
    description: 'Global Zustand store.',
  },
  {
    id: 'readme',
    name: 'README.md',
    icon: () => <FileIcon label="md" size={16} />,
    description: 'Project documentation.',
    card: () => (
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{fontWeight: 600, marginBottom: 2}}>Quick facts</div>
        <div style={{display: 'flex', justifyContent: 'space-between', opacity: 0.8}}>
          <span>Size</span><span>4.2 KB</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', opacity: 0.8}}>
          <span>Last modified</span><span>2 days ago</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', opacity: 0.8}}>
          <span>Author</span><span>streamich</span>
        </div>
      </div>
    ),
  },
  {
    id: 'config',
    name: 'tsconfig.json',
    icon: () => <FileIcon label="json" size={16} />,
    card: () => (
      <div>
        <pre style={{margin: 0, fontSize: 11, opacity: 0.85, whiteSpace: 'pre-wrap'}}>
          {`{\n  "extends": "./tsconfig.base.json",\n  "compilerOptions": {\n    "outDir": "lib"\n  }\n}`}
        </pre>
      </div>
    ),
  },
  {
    id: 'plain',
    name: 'No tooltip',
    deletable: false,
  },
];

export const TooltipWithDescription: StoryObj<typeof meta> = {
  name: 'Tooltip - description',
  args: {
    bg: '#ffd9df',
    render: () => <div style={{height: 8}} />,
    tabs: tabsWithTooltips.slice(0, 2),
    addNewTab,
  },
  decorators: [wrap(600)],
};

export const TooltipWithCard: StoryObj<typeof meta> = {
  name: 'Tooltip - card slot',
  args: {
    bg: '#d6f0e0',
    render: () => <div style={{height: 8}} />,
    tabs: tabsWithTooltips,
    addNewTab,
  },
  decorators: [wrap(700)],
};

export const TooltipDark: StoryObj<typeof meta> = {
  name: 'Tooltip - dark',
  args: {
    bg: '#1a1f2e',
    render: () => <div style={{height: 8}} />,
    tabs: tabsWithTooltips,
    addNewTab,
  },
  decorators: [wrap(700)],
};
