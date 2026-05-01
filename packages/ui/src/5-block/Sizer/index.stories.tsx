import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Sizer, SizerState} from '.';
import {Placeholder} from '../../3-list-item/Placeholder';

const meta: Meta<typeof Sizer> = {
  title: '5. Block/Sizer',
  component: Sizer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const frameStyle: React.CSSProperties = {
  border: '1px solid rgba(127,127,127,.3)',
  background: 'rgba(127,127,127,.04)',
  display: 'flex',
  flexDirection: 'column',
};

const Body: React.FC<{lines?: number}> = ({lines = 12}) => (
  <div style={{padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 12}}>
    <Placeholder variant="text" width="40%" height={28} />
    <Placeholder variant="paragraph" lines={lines} />
    <Placeholder variant="image" />
    <Placeholder variant="paragraph" lines={4} />
  </div>
);

export const Basic: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(720), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state}>
          <Body />
        </Sizer>
      </div>
    );
  },
};

export const HandlePadding: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(720), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} handlePadding={64}>
          <Body />
        </Sizer>
      </div>
    );
  },
};

export const HandleMaxHeight: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(720), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} handlePadding={32} handleMaxHeight={200}>
          <Body />
        </Sizer>
      </div>
    );
  },
};

export const HandleMargin: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(720), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} handleMargin={24} handlePadding={32}>
          <Body />
        </Sizer>
      </div>
    );
  },
};

export const ThickHandle: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(720), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} handleWidth={4} handlePadding={32} handleMaxHeight={300}>
          <Body />
        </Sizer>
      </div>
    );
  },
};

export const MinWidth: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(900), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} minWidth={400}>
          <Body lines={6} />
        </Sizer>
      </div>
    );
  },
};

export const NotResizable: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(640), []);
    return (
      <div style={frameStyle}>
        <Sizer state={state} resizable={false}>
          <Body lines={6} />
        </Sizer>
      </div>
    );
  },
};

export const ExternalState: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(640), []);
    const containerWidth = state.width.use();
    const contentWidth = state.content.use();
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#666'}}>
          Container: <strong>{containerWidth}px</strong> · Content:{' '}
          <strong>{contentWidth}px</strong>
        </div>
        <div style={frameStyle}>
          <Sizer state={state} handlePadding={32} handleMaxHeight={300}>
            <Body lines={8} />
          </Sizer>
        </div>
      </div>
    );
  },
};

export const NarrowContainer: StoryObj<typeof meta> = {
  render: () => {
    const state = React.useMemo(() => new SizerState(800), []);
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: 480, border: '1px solid rgba(127,127,127,.3)'}}>
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
          <Sizer state={state} handlePadding={32} handleMaxHeight={400}>
            <Body lines={10} />
          </Sizer>
        </div>
      </div>
    );
  },
};
