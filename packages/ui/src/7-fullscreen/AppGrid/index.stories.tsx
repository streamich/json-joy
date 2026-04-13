import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {AppGrid} from '.';
import {Placeholder} from '../../3-list-item/Placeholder';
import {AppGridColumn} from './components/AppGridColumn';

const meta: Meta<typeof AppGrid> = {
  title: '7. Fullscreen/AppGrid',
  component: AppGrid,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const SidebarContent = () => (
  <div style={{padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
    <Placeholder variant="text" width="55%" />
    <Placeholder variant="block" />
    <Placeholder variant="block" />
    <Placeholder variant="block" />
    <Placeholder variant="text" width="40%" />
    <Placeholder variant="block" />
    <Placeholder variant="block" />
  </div>
);

const HeaderContent = () => (
  <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px'}}>
    <Placeholder variant="text" width="120px" />
    <Placeholder variant="text" width="80px" />
    <Placeholder variant="text" width="100px" />
  </div>
);

const FooterContent = () => (
  <div style={{display: 'flex', gap: '12px', alignItems: 'center', padding: '0 8px'}}>
    <Placeholder variant="text" width="90px" />
    <Placeholder variant="text" width="60px" />
  </div>
);

const MainContent = () => (
  <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px'}}>
    <Placeholder variant="image" height="220px" />
    <Placeholder variant="text" width="40%" />
    <Placeholder variant="paragraph" lines={3} />
    <Placeholder variant="button" width="180px" />
  </div>
);

export const Primary: StoryObj<typeof meta> = {
  render: (args) => <AppGrid {...args} />,
  args: {
    left: <SidebarContent />,
    header: <HeaderContent />,
    footer: <FooterContent />,
    children: <MainContent />,
  },
};

export const WithRightSidebar: StoryObj<typeof meta> = {
  render: (args) => <AppGrid {...args} />,
  args: {
    left: <SidebarContent />,
    right: <SidebarContent />,
    header: <HeaderContent />,
    footer: <FooterContent />,
    children: <MainContent />,
  },
};

export const NoSidebar: StoryObj<typeof meta> = {
  render: (args) => <AppGrid {...args} />,
  args: {
    header: <HeaderContent />,
    footer: <FooterContent />,
    children: <MainContent />,
  },
};

const LongSidebarContent = () => (
  <div style={{padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
    {Array.from({length: 6}, (_, s) => (
      <React.Fragment key={s}>
        <Placeholder variant="text" width={`${45 + (s * 7) % 25}%`} />
        {Array.from({length: 4 + (s % 3)}, (_, i) => (
          <Placeholder key={i} variant="block" />
        ))}
      </React.Fragment>
    ))}
  </div>
);

const LongMainContent = () => (
  <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px'}}>
    {Array.from({length: 8}, (_, i) => (
      <div key={i} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <Placeholder variant="image" height={`${160 + (i % 3) * 60}px`} />
        <Placeholder variant="text" width={`${30 + (i * 9) % 40}%`} />
        <Placeholder variant="paragraph" lines={2 + (i % 3)} />
        {i % 2 === 0 && <Placeholder variant="button" width="160px" />}
      </div>
    ))}
  </div>
);

export const ScrollOverflow: StoryObj<typeof meta> = {
  render: (args) => <AppGrid {...args} />,
  args: {
    left: (
      <AppGridColumn header={<HeaderContent />} footer={<FooterContent />} scrollRailWidth={4}>
        <LongSidebarContent />
      </AppGridColumn>
    ),
    right: <LongSidebarContent />,
    header: <HeaderContent />,
    footer: <FooterContent />,
    children: <LongMainContent />,
  },
};
