import * as React from 'react';
import {ColorPicker} from '.';
import type {ColorResult} from '@uiw/color-convert';

export default {
  component: ColorPicker,
  title: '<ColorPicker>',
};

export const Default = {
  render: () => <ColorPicker color="#3b82f6" />,
};

export const NoAlpha = {
  render: () => <ColorPicker color="#10b981" disableAlpha />,
};

const Controlled: React.FC = () => {
  const [color, setColor] = React.useState('#f97316');
  const handleChange = (result: ColorResult) => setColor(result.hex);
  return (
    <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
      <ColorPicker color={color} onChange={handleChange} />
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          background: color,
          border: '1px solid rgba(0,0,0,.12)',
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export const ControlledWithPreview = {
  render: () => <Controlled />,
};

const MultiPicker: React.FC = () => {
  const [fg, setFg] = React.useState('#1e293b');
  const [bg, setBg] = React.useState('#f1f5f9');
  return (
    <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
      <div>
        <div style={{marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          Foreground
        </div>
        <ColorPicker color={fg} onChange={(r) => setFg(r.hex)} />
      </div>
      <div>
        <div style={{marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          Background
        </div>
        <ColorPicker color={bg} onChange={(r) => setBg(r.hex)} />
      </div>
      <div
        style={{
          padding: '16px 24px',
          borderRadius: 8,
          background: bg,
          color: fg,
          border: '1px solid rgba(0,0,0,.08)',
          alignSelf: 'center',
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Preview Text
      </div>
    </div>
  );
};

export const ForegroundBackground = {
  render: () => <MultiPicker />,
};
