import * as React from 'react';
import {ScrollArea, Viewport, ScrollRail, Thumb, Marker, Header, Footer} from '.';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/ScrollArea',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const lines = Array.from({length: 100}, (_, i) => `Line ${i + 1}: Lorem ipsum dolor sit amet`);

export const Primary: StoryObj = {
  render: () => (
    <ScrollArea style={{width: 400, height: 300, border: '1px solid #ccc'}}>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line) => (
            <div key={line} style={{padding: '2px 0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail />
    </ScrollArea>
  ),
};

export const WithShadows: StoryObj = {
  render: () => (
    <ScrollArea shadow style={{width: 400, height: 300, border: '1px solid #ccc'}}>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line) => (
            <div key={line} style={{padding: '2px 0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail />
    </ScrollArea>
  ),
};

export const ShadowedHeaderFooter: StoryObj = {
  render: () => (
    <ScrollArea shadow alwaysVisible railWidth={14} style={{width: 400, height: 350, border: '1px solid #ccc'}}>
      <Header>
        <div style={{padding: '10px 16px', background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid #ddd'}}>
          Search Results
        </div>
      </Header>
      <Viewport>
        <div style={{padding: 16, background: '#fff'}}>
          {lines.map((line, index) => (
            <div key={line} style={{padding: '6px 0', borderBottom: index === lines.length - 1 ? 'none' : '1px solid #f0f0f0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail>
        <Thumb />
      </ScrollRail>
      <Footer>
        <div style={{padding: '10px 16px', background: 'rgba(255,255,255,0.92)', borderTop: '1px solid #ddd'}}>
          100 visible rows
        </div>
      </Footer>
    </ScrollArea>
  ),
};

export const AlwaysVisible: StoryObj = {
  render: () => (
    <ScrollArea alwaysVisible railWidth={14} style={{width: 400, height: 300, border: '1px solid #ccc'}}>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line) => (
            <div key={line} style={{padding: '2px 0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail>
        <Thumb />
      </ScrollRail>
    </ScrollArea>
  ),
};

export const WithMarkers: StoryObj = {
  render: () => (
    <ScrollArea alwaysVisible railWidth={40} style={{width: 400, height: 300, border: '1px solid #ccc'}}>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line, i) => (
            <div key={line} style={{padding: '2px 0', color: i === 14 || i === 71 ? 'red' : undefined}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail>
        <Thumb />
        <Marker position={0.15} color="red" />
        <Marker position={0.72} color="red" />
        <Marker position={0.45} color="orange" height={3} />
      </ScrollRail>
    </ScrollArea>
  ),
};

export const WithHeaderFooter: StoryObj = {
  render: () => (
    <ScrollArea alwaysVisible railWidth={14} style={{width: 400, height: 350, border: '1px solid #ccc'}}>
      <Header>
        <div style={{padding: '8px 16px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid #ddd'}}>Sticky Header</div>
      </Header>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line) => (
            <div key={line} style={{padding: '2px 0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail>
        <Thumb />
      </ScrollRail>
      <Footer>
        <div style={{padding: '8px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid #ddd'}}>Line 1 / 100</div>
      </Footer>
    </ScrollArea>
  ),
};

export const Resizable: StoryObj = {
  render: () => {
    const [size, setSize] = React.useState({width: 400, height: 300});
    const randomize = () =>
      setSize({
        width: 200 + Math.floor(Math.random() * 400),
        height: 150 + Math.floor(Math.random() * 400),
      });
    return (
      <div>
        <button type="button" onClick={randomize} style={{marginBottom: 8}}>
          Randomize size ({size.width} × {size.height})
        </button>
        <ScrollArea
          alwaysVisible
          railWidth={14}
          style={{
            width: size.width,
            height: size.height,
            border: '1px solid #ccc',
            transition: 'width .3s, height .3s',
          }}
        >
          <Viewport>
            <div style={{padding: 16}}>
              {lines.map((line) => (
                <div key={line} style={{padding: '2px 0'}}>
                  {line}
                </div>
              ))}
            </div>
          </Viewport>
          <ScrollRail>
            <Thumb />
          </ScrollRail>
        </ScrollArea>
      </div>
    );
  },
};

export const CustomMarkerRendering: StoryObj = {
  render: () => (
    <ScrollArea alwaysVisible railWidth={50} style={{width: 400, height: 300, border: '1px solid #ccc'}}>
      <Viewport>
        <div style={{padding: 16}}>
          {lines.map((line) => (
            <div key={line} style={{padding: '2px 0'}}>
              {line}
            </div>
          ))}
        </div>
      </Viewport>
      <ScrollRail>
        <Thumb />
        <Marker position={0.3}>
          {(style) => (
            <div
              style={{
                ...style,
                position: 'absolute',
                left: 2,
                right: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: 12,
                background: 'rgba(255,0,0,0.15)',
                borderRadius: 2,
                padding: '0 2px',
              }}
            >
              <span style={{width: 4, height: 4, borderRadius: '50%', background: 'red', flexShrink: 0}} />
              <span style={{fontSize: 8, color: 'red', whiteSpace: 'nowrap'}}>err</span>
            </div>
          )}
        </Marker>
      </ScrollRail>
    </ScrollArea>
  ),
};
