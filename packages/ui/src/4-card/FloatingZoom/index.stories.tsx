import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {FloatingZoom} from '.';

const VIDEO_URL = 'https://appsets.jsonjoy.com/ui/elements/clickable-json-editing-720x486.mp4';

const meta: Meta<typeof FloatingZoom> = {
  title: '4. Card/FloatingZoom',
  component: FloatingZoom,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

/** The lens is positioned over a relative box; here `(x, y)` puts it lower-right. */
const Box: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 280}) => (
  <div
    style={{
      position: 'relative',
      width: 560,
      height: 360,
      borderRadius: 16,
      background: 'linear-gradient(135deg, #eef1f6 0%, #dfe4ec 100%)',
      border: '1px solid rgba(18,26,48,.12)',
    }}
  >
    <FloatingZoom size={size} x={x} y={y}>
      <video src={VIDEO_URL} width="100%" autoPlay muted loop controls={false} style={{display: 'block'}} />
    </FloatingZoom>
  </div>
);

export const Primary: StoryObj<typeof meta> = {
  render: () => <Box x={0.74} y={0.7} />,
};

export const Centered: StoryObj<typeof meta> = {
  render: () => <Box x={0.5} y={0.5} size={220} />,
};

export const NoRing: StoryObj<typeof meta> = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 560,
        height: 360,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #eef1f6 0%, #dfe4ec 100%)',
        border: '1px solid rgba(18,26,48,.12)',
      }}
    >
      <FloatingZoom size={240} x={0.3} y={0.45} ring={false}>
        <video src={VIDEO_URL} width="100%" autoPlay muted loop controls={false} style={{display: 'block'}} />
      </FloatingZoom>
    </div>
  ),
};
