import * as React from 'react';
import {ColorDisplayLayout} from './ColorDisplayLayout';

export default {
  component: ColorDisplayLayout,
  title: '<ColorDisplayLayout>',
};

export const Default = {
  render: () => <ColorDisplayLayout color="#3b82f6" />,
  decorators: [
    (Story: any) => (
      <div style={{width: 400, padding: 16, boxSizing: 'border-box', background: '#f1f5f9'}}>
        <Story />
      </div>
    ),
  ],
};

export const Transparency = {
  render: () => <ColorDisplayLayout color="#7a39a255" />,
  decorators: [
    (Story: any) => (
      <div style={{width: 400, padding: 16, boxSizing: 'border-box', background: '#f1f5f9'}}>
        <Story />
      </div>
    ),
  ],
};
