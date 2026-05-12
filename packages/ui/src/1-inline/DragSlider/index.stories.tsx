import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {DragSlider as Component, type DragSliderProps} from '.';
import {DragSliderHandle} from './DragSliderHandle';
import {SliderHandle} from '../SliderHandle';

const meta: Meta<typeof Component> = {
  title: '1. Inline/DragSlider',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const tinyHandleStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 8,
  height: 16,
  background: 'currentColor',
  borderRadius: 2,
  opacity: 0.5,
};

const inputCellStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: 'rgba(128,128,128,0.08)',
  borderRadius: 6,
  padding: '6px 10px',
  fontFamily: 'monospace',
  fontSize: 14,
  minWidth: 120,
  justifyContent: 'space-between',
};

const numberStyle: React.CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
};

const Demo: React.FC<Partial<DragSliderProps>> = (props) => {
  const [value, setValue] = React.useState(50);
  return (
    <div style={{minWidth: 300, display: 'flex', flexDirection: 'column', gap: 24}}>
      <p style={{margin: 0, fontSize: 13, opacity: 0.7}}>
        Click and drag the small handle to scrub the value. ESC cancels.
      </p>
      <div style={inputCellStyle}>
        <span style={numberStyle}>{value.toFixed(2)}</span>
        <Component value={value} onChange={setValue} {...props}>
          <span style={tinyHandleStyle} />
        </Component>
      </div>
    </div>
  );
};

export const Basic: StoryObj<typeof meta> = {
  name: 'Basic (unbounded)',
  render: (args) => <Demo {...args} sensitivity={1} />,
};

export const Bounded: StoryObj<typeof meta> = {
  name: 'Bounded 0..100',
  render: (args) => <Demo {...args} min={0} max={100} sensitivity={0.5} />,
};

export const HighSensitivity: StoryObj<typeof meta> = {
  name: 'High sensitivity',
  render: (args) => <Demo {...args} sensitivity={5} />,
};

export const LowSensitivity: StoryObj<typeof meta> = {
  name: 'Low sensitivity (fine)',
  render: (args) => <Demo {...args} sensitivity={0.05} />,
};

export const Stepped: StoryObj<typeof meta> = {
  name: 'Stepped (integer)',
  render: () => {
    const [value, setValue] = React.useState(10);
    return (
      <div style={{minWidth: 300}}>
        <p style={{margin: '0 0 12px', fontSize: 13, opacity: 0.7}}>Snaps to integer steps.</p>
        <div style={inputCellStyle}>
          <span style={numberStyle}>{value}</span>
          <Component value={value} onChange={setValue} step={1} format={(v) => String(v)}>
            <span style={tinyHandleStyle} />
          </Component>
        </div>
      </div>
    );
  },
};

export const VerticalAxis: StoryObj<typeof meta> = {
  name: 'Vertical axis',
  render: (args) => <Demo {...args} axis="y" sensitivity={0.5} />,
};

export const FreeLine: StoryObj<typeof meta> = {
  name: 'Diagonal line (free)',
  render: (args) => <Demo {...args} lineAxis="free" sensitivity={0.5} />,
};

export const HorizontalLine: StoryObj<typeof meta> = {
  name: 'Horizontal line fixed',
  render: (args) => <Demo {...args} axis="x" lineAxis="x" sensitivity={0.5} />,
};

export const VerticalLine: StoryObj<typeof meta> = {
  name: 'Vertical line fixed',
  render: (args) => <Demo {...args} axis="y" lineAxis="y" sensitivity={0.5} />,
};

export const InsideInput: StoryObj<typeof meta> = {
  name: 'Numeric input cell',
  render: () => {
    const [value, setValue] = React.useState(42.5);
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(128,128,128,0.08)',
          borderRadius: 6,
          padding: '4px 10px',
          gap: 8,
          fontFamily: 'monospace',
          fontSize: 14,
          minWidth: 160,
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          style={{
            border: 0,
            background: 'transparent',
            outline: 'none',
            font: 'inherit',
            width: '100%',
          }}
        />
        <Component value={value} onChange={setValue} sensitivity={0.5} format={(v) => v.toFixed(2)}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 14,
              height: 18,
              opacity: 0.5,
              fontSize: 10,
              userSelect: 'none',
            }}
          >
            ⇔
          </span>
        </Component>
      </div>
    );
  },
};

export const NoTooltip: StoryObj<typeof meta> = {
  name: 'No tooltip',
  render: (args) => <Demo {...args} hideTooltip />,
};

export const CustomFormat: StoryObj<typeof meta> = {
  name: 'Custom format (degrees)',
  render: () => {
    const [value, setValue] = React.useState(45);
    return (
      <div style={{minWidth: 300}}>
        <div style={inputCellStyle}>
          <span style={numberStyle}>{value.toFixed(0)}°</span>
          <Component
            value={value}
            onChange={setValue}
            min={0}
            max={360}
            step={1}
            sensitivity={1}
            format={(v) => `${v.toFixed(0)}°`}
          >
            <span style={tinyHandleStyle} />
          </Component>
        </div>
      </div>
    );
  },
};

export const Disabled: StoryObj<typeof meta> = {
  name: 'Disabled',
  render: (args) => <Demo {...args} disabled />,
};

const WithDefaultHandle: React.FC<Partial<DragSliderProps> & {variant?: 'dots' | 'bar'}> = ({variant, ...props}) => {
  const [value, setValue] = React.useState(50);
  return (
    <div style={{minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12}}>
      <p style={{margin: 0, fontSize: 13, opacity: 0.7}}>Drag the handle. It darkens on hover and squeezes on press.</p>
      <div style={inputCellStyle}>
        <span style={numberStyle}>{value.toFixed(2)}</span>
        <Component value={value} onChange={setValue} {...props}>
          <DragSliderHandle variant={variant} />
        </Component>
      </div>
    </div>
  );
};

export const WithHandleBar: StoryObj<typeof meta> = {
  name: 'Default handle (bar)',
  render: (args) => <WithDefaultHandle {...args} />,
};

export const WithHandleDots: StoryObj<typeof meta> = {
  name: 'Default handle (dots)',
  render: (args) => <WithDefaultHandle {...args} variant="dots" />,
};

export const WithSliderHandle: StoryObj<typeof meta> = {
  name: 'With SliderHandle (matches <Slider>)',
  render: () => {
    const [value, setValue] = React.useState(50);
    return (
      <div style={{minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12}}>
        <p style={{margin: 0, fontSize: 13, opacity: 0.7}}>
          Slider-style thumb wrapped in a DragSlider. The handle auto-morphs during drag via context.
        </p>
        <div style={inputCellStyle}>
          <span style={numberStyle}>{value.toFixed(2)}</span>
          <Component value={value} onChange={setValue} sensitivity={0.5}>
            <SliderHandle />
          </Component>
        </div>
      </div>
    );
  },
};

export const HandleGallery: StoryObj<typeof meta> = {
  name: 'Handle sizes',
  render: () => {
    const [value, setValue] = React.useState(50);
    const row: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(128,128,128,0.08)',
      borderRadius: 6,
      padding: '4px 10px',
      fontFamily: 'monospace',
      fontSize: 13,
      minWidth: 160,
      justifyContent: 'space-between',
    };
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={row}>
          <span style={numberStyle}>{value.toFixed(2)}</span>
          <Component value={value} onChange={setValue}>
            <DragSliderHandle width={8} height={14} />
          </Component>
        </div>
        <div style={row}>
          <span style={numberStyle}>{value.toFixed(2)}</span>
          <Component value={value} onChange={setValue}>
            <DragSliderHandle />
          </Component>
        </div>
        <div style={row}>
          <span style={numberStyle}>{value.toFixed(2)}</span>
          <Component value={value} onChange={setValue}>
            <DragSliderHandle width={16} height={22} variant="bar" />
          </Component>
        </div>
      </div>
    );
  },
};
