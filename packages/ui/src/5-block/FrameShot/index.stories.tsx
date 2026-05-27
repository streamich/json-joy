import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {FrameShot} from '.';
import {FloatingZoom} from '../../4-card/FloatingZoom';
import {Placeholder} from '../../3-list-item/Placeholder';

const VIDEO_URL = 'https://appsets.jsonjoy.com/ui/elements/clickable-json-editing-720x486.mp4';
const ASPECT = 1101 / 968;

const meta: Meta<typeof FrameShot> = {
  title: '5. Block/FrameShot',
  component: FrameShot,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

/** Plain grey stand-in for a real app screenshot. */
const FakeWindow: React.FC = () => (
  <Placeholder variant="image" style={{width: '100%', height: 'auto', aspectRatio: `${ASPECT}`}} />
);

const lens = (
  <FloatingZoom size={300} x={0.82} y={0.78} hideBelow={1160}>
    <div style={{width: 443, margin: '12px 0 0 -59px'}}>
      <video src={VIDEO_URL} width="100%" autoPlay muted loop controls={false} style={{display: 'block'}} />
    </div>
  </FloatingZoom>
);

const content = (
  <div style={{maxWidth: 320}}>
    <h2 style={{font: '800 34px/1.1 system-ui', margin: '0 0 12px'}}>JSON CRDT Explorer</h2>
    <p style={{font: '15px/1.55 system-ui', color: '#5b6477', margin: '0 0 20px'}}>
      An app to explore, debug, and edit your JSON CRDT and plain JSON documents.
    </p>
    <button
      style={{
        font: '600 14px system-ui',
        padding: '12px 22px',
        borderRadius: 10,
        border: 'none',
        background: '#15181f',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      Open Explorer
    </button>
  </div>
);

export const Primary: StoryObj<typeof meta> = {
  render: () => (
    <div style={{padding: '64px 0'}}>
      <FrameShot
        eyebrow="Playground"
        title="See it in action"
        subtitle="The screenshot scales with the viewport and slides away on narrow screens."
        wider
        content={content}
        screenshot={<FakeWindow />}
        screenshotAspect={ASPECT}
        anchor="bottom-right"
        split={36}
        edgeGap={-16}
      >
        {lens}
      </FrameShot>
    </div>
  ),
};

export const AnchorLeft: StoryObj<typeof meta> = {
  render: () => (
    <div style={{padding: '64px 0'}}>
      <FrameShot
        eyebrow="Playground"
        title="Anchored bottom-left"
        wider
        content={content}
        screenshot={<FakeWindow />}
        screenshotAspect={ASPECT}
        anchor="bottom-left"
        split={36}
        edgeGap={24}
      />
    </div>
  ),
};
