import * as React from 'react';
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {SplitPane} from './components/SplitPane';
import {Pane} from './components/Pane';

const paneStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: 'monospace',
  fontSize: 13,
  background: 'rgba(127,127,127,.05)',
  height: '100%',
  boxSizing: 'border-box',
};

const meta: Meta<typeof SplitPane> = {
  title: '5. Block/SplitPane',
  component: SplitPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Horizontal: StoryObj<typeof meta> = {
  render: () => (
    <SplitPane direction="horizontal" style={{height: 300}}>
      <Pane defaultSize={200} minSize={100}>
        <div style={paneStyle}>Left pane</div>
      </Pane>
      <Pane>
        <div style={paneStyle}>Right pane</div>
      </Pane>
    </SplitPane>
  ),
};

export const Vertical: StoryObj<typeof meta> = {
  render: () => (
    <SplitPane direction="vertical" style={{height: 400}}>
      <Pane defaultSize={150} minSize={80}>
        <div style={paneStyle}>Top pane</div>
      </Pane>
      <Pane>
        <div style={paneStyle}>Bottom pane</div>
      </Pane>
    </SplitPane>
  ),
};

export const ThreePanes: StoryObj<typeof meta> = {
  render: () => (
    <SplitPane direction="horizontal" style={{height: 300}}>
      <Pane defaultSize={160} minSize={80}>
        <div style={paneStyle}>File tree</div>
      </Pane>
      <Pane defaultSize={320} minSize={120}>
        <div style={paneStyle}>Editor</div>
      </Pane>
      <Pane minSize={100}>
        <div style={paneStyle}>Preview</div>
      </Pane>
    </SplitPane>
  ),
};

export const SnapPoints: StoryObj<typeof meta> = {
  render: () => (
    <SplitPane direction="horizontal" snapPoints={[150, 300, 450]} snapTolerance={15} style={{height: 300}}>
      <Pane defaultSize={300} minSize={80}>
        <div style={paneStyle}>Snaps at 150 / 300 / 450 px</div>
      </Pane>
      <Pane>
        <div style={paneStyle}>Right pane</div>
      </Pane>
    </SplitPane>
  ),
};

export const Controlled: StoryObj<typeof meta> = {
  render: () => {
    const [sizes, setSizes] = useState<number[]>([250, 350]);

    return (
      <div>
        <div style={{padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 4}}>
          Left: {Math.round(sizes[0] ?? 0)}px &nbsp;|&nbsp; Right: {Math.round(sizes[1] ?? 0)}px
        </div>
        <SplitPane direction="horizontal" onResize={(s) => setSizes(s)} style={{height: 280}}>
          <Pane size={sizes[0]} minSize={80}>
            <div style={paneStyle}>Left (controlled)</div>
          </Pane>
          <Pane size={sizes[1]} minSize={80}>
            <div style={paneStyle}>Right (controlled)</div>
          </Pane>
        </SplitPane>
      </div>
    );
  },
};

export const NonResizable: StoryObj<typeof meta> = {
  render: () => (
    <SplitPane direction="horizontal" resizable={false} style={{height: 300}}>
      <Pane defaultSize={200}>
        <div style={paneStyle}>Fixed left (200px)</div>
      </Pane>
      <Pane>
        <div style={paneStyle}>Fixed right</div>
      </Pane>
    </SplitPane>
  ),
};
