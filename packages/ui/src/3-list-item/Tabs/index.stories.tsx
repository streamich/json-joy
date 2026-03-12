import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Tabs} from '.';

const meta: Meta<typeof Tabs> = {
  title: '3. List Item/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const card = (label: string) => (
  <div
    style={{
      padding: '20px 16px',
      fontSize: 14,
      color: '#555',
      background: '#fafafa',
      borderRadius: 8,
      marginTop: 4,
    }}
  >
    {label}
  </div>
);

const THREE_TABS = [
  {key: 'overview', label: 'Overview', content: card('Overview content goes here.')},
  {key: 'details', label: 'Details', content: card('Details panel.')},
  {key: 'history', label: 'History', content: card('History log.')},
];

const decorator = (width: number) => (Story: any) =>
  (
    <div style={{width}}>
      <Story />
    </div>
  );

export const Primary: StoryObj<typeof meta> = {
  args: {
    items: THREE_TABS,
    defaultActive: 'overview',
  },
  decorators: [decorator(340)],
};

export const TwoTabs: StoryObj<typeof meta> = {
  args: {
    items: [
      {key: 'code', label: 'Code', content: card('Code editor.')},
      {key: 'preview', label: 'Preview', content: card('Live preview.')},
    ],
    defaultActive: 'code',
  },
  decorators: [decorator(280)],
};

const MANY_TABS = Array.from({length: 12}, (_, i) => ({
  key: `tab${i}`,
  label: `Tab ${i + 1}`,
  content: card(`Content for Tab ${i + 1}`),
}));

export const ManyTabs: StoryObj<typeof meta> = {
  args: {
    items: MANY_TABS,
    defaultActive: 'tab0',
  },
  decorators: [decorator(380)],
};

export const ManyTabsNarrow: StoryObj<typeof meta> = {
  args: {
    items: MANY_TABS,
    defaultActive: 'tab5',
  },
  decorators: [decorator(220)],
};

const ControlledExample: React.FC = () => {
  const [active, setActive] = React.useState('b');
  return (
    <div style={{width: 360}}>
      <Tabs
        items={[
          {key: 'a', label: 'Alpha', content: card('Alpha panel.')},
          {key: 'b', label: 'Beta', content: card('Beta panel.')},
          {key: 'c', label: 'Gamma', content: card('Gamma panel.')},
        ]}
        active={active}
        onChange={setActive}
      />
      <p style={{marginTop: 12, fontSize: 13, color: '#888'}}>
        Active key: <strong>{active}</strong>
      </p>
    </div>
  );
};

export const Controlled: StoryObj<typeof meta> = {
  render: () => <ControlledExample />,
};

export const NoContent: StoryObj<typeof meta> = {
  args: {
    items: [
      {key: 'a', label: 'Alpha'},
      {key: 'b', label: 'Beta'},
      {key: 'c', label: 'Gamma'},
    ],
    defaultActive: 'a',
  },
  decorators: [decorator(300)],
};
