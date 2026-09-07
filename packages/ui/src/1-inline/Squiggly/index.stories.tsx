import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {plainCirclePath, Squiggly, squigglyCirclePath} from '.';

const meta: Meta<typeof Squiggly> = {
  title: '1. Inline/Squiggly',
  component: Squiggly,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {
    amplitude: {control: {type: 'range', min: 0, max: 8, step: 0.5}},
    wavelength: {control: {type: 'range', min: 2, max: 30, step: 1}},
    thickness: {control: {type: 'range', min: 0.5, max: 6, step: 0.5}},
    resolution: {control: {type: 'range', min: 2, max: 24, step: 1}},
    phase: {control: {type: 'range', min: 0, max: 6.28, step: 0.1}},
    color: {control: {type: 'color'}},
    straight: {control: {type: 'boolean'}},
    dash: {control: {type: 'text'}},
  },
};

export default meta;

/** Interactive playground — tweak amplitude / wavelength / thickness in the controls panel. */
export const Playground: StoryObj<typeof meta> = {
  args: {width: 280, height: 28, color: '#e5484d', amplitude: 3, wavelength: 10, thickness: 1.5, resolution: 8},
};

export const WavyLine: StoryObj<typeof meta> = {
  args: {width: 240, height: 24, color: '#e5484d', amplitude: 3, wavelength: 10, thickness: 1.5},
};

export const StraightLine: StoryObj<typeof meta> = {
  args: {width: 240, height: 2, straight: true, color: '#2563eb', thickness: 2},
};

export const DottedUnderline: StoryObj<typeof meta> = {
  args: {width: 200, height: 2, straight: true, dash: '2 3', thickness: 2, color: '#d29922'},
};

/** The classic use: a wavy spell-check underline tucked beneath a word. */
export const SpellCheckUnderline: StoryObj = {
  render: () => (
    <p style={{font: '22px/1.6 ui-sans-serif, system-ui, sans-serif', margin: 0}}>
      The quick brown{' '}
      <span style={{position: 'relative', display: 'inline-block'}}>
        f?x
        <Squiggly
          width={34}
          height={6}
          from={[0, 3]}
          to={[34, 3]}
          amplitude={1.6}
          wavelength={5}
          thickness={1.5}
          color="#e5484d"
          style={{position: 'absolute', left: 0, bottom: -4}}
        />
      </span>{' '}
      jumps over the{' '}
      <span style={{position: 'relative', display: 'inline-block'}}>
        laz“y
        <Squiggly
          width={38}
          height={6}
          from={[0, 3]}
          to={[38, 3]}
          amplitude={1.6}
          wavelength={5}
          thickness={1.5}
          color="#3b82f6"
          style={{position: 'absolute', left: 0, bottom: -4}}
        />
      </span>{' '}
      dog.
    </p>
  ),
};

/** Solid / dashed / dotted / wavy — the connector-style palette. */
export const StyleGallery: StoryObj = {
  render: () => {
    const w = 220;
    const Row: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{width: 70, font: '13px ui-monospace, monospace', color: '#888'}}>{label}</span>
        {children}
      </div>
    );
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <Row label="solid">
          <Squiggly width={w} height={2} straight thickness={2} color="#555" />
        </Row>
        <Row label="dashed">
          <Squiggly width={w} height={2} straight dash="6 4" thickness={2} color="#555" />
        </Row>
        <Row label="dotted">
          <Squiggly width={w} height={2} straight dash="2 3" thickness={2} color="#555" />
        </Row>
        <Row label="wavy">
          <Squiggly width={w} height={16} amplitude={2} wavelength={8} thickness={1.5} color="#555" />
        </Row>
        <Row label="loud">
          <Squiggly width={w} height={24} amplitude={5} wavelength={14} thickness={2} color="#7c3aed" />
        </Row>
      </div>
    );
  },
};

/** Vertical guides — straight vs wavy — as the file Tree's indent connectors use. */
export const VerticalConnector: StoryObj = {
  render: () => (
    <div style={{display: 'flex', gap: 40}}>
      <Squiggly width={8} height={120} from={[4, 0]} to={[4, 120]} straight color="#888" />
      <Squiggly width={8} height={120} from={[4, 0]} to={[4, 120]} amplitude={1.2} wavelength={5} color="#888" />
      <Squiggly width={8} height={120} from={[4, 0]} to={[4, 120]} amplitude={2.5} wavelength={9} color="#888" />
    </div>
  ),
};

/** A tree-style elbow: vertical drop + horizontal stub to the child. */
export const TreeElbow: StoryObj = {
  render: () => {
    const fancy = (key: string, top: number) => (
      <React.Fragment key={key}>
        {/* vertical segment, top to middle */}
        <Squiggly
          width={6}
          height={28}
          from={[3, 0]}
          to={[3, 28]}
          amplitude={1.2}
          wavelength={5}
          color="#999"
          style={{position: 'absolute', left: 8, top}}
        />
        {/* horizontal stub, middle to chevron */}
        <Squiggly
          width={16}
          height={6}
          from={[0, 3]}
          to={[16, 3]}
          amplitude={1.2}
          wavelength={5}
          color="#999"
          style={{position: 'absolute', left: 11, top: top + 26}}
        />
      </React.Fragment>
    );
    return (
      <div
        style={{
          position: 'relative',
          width: 220,
          height: 120,
          font: '13px ui-monospace, monospace',
          color: '#444',
        }}
      >
        <div style={{paddingLeft: 8}}>▾ src</div>
        {fancy('a', 14)}
        <div style={{paddingLeft: 32, marginTop: 6}}>app.ts</div>
        {fancy('b', 42)}
        <div style={{paddingLeft: 32, marginTop: 6}}>state.ts</div>
      </div>
    );
  },
};

/** Works at any angle — the wave is applied perpendicular to the segment. */
export const Diagonal: StoryObj = {
  render: () => (
    <Squiggly
      width={200}
      height={120}
      from={[0, 110]}
      to={[200, 10]}
      amplitude={3}
      wavelength={12}
      color="#16a34a"
      thickness={1.5}
    />
  ),
};

/**
 * The exported path helpers also draw circles: `squigglyCirclePath` for a wavy
 * ring (used by the MuTxt stepper bullet), `plainCirclePath` for a smooth one.
 */
export const Circles: StoryObj = {
  render: () => {
    const size = 90;
    const c = size / 2;
    return (
      <div style={{display: 'flex', gap: 28}}>
        <svg width={size} height={size}>
          <path d={squigglyCirclePath(c, c - 8, 14, 3)} fill="none" stroke="#e5484d" strokeWidth={1.5} />
        </svg>
        <svg width={size} height={size}>
          <path d={squigglyCirclePath(c, c - 8, 24, 2)} fill="none" stroke="#7c3aed" strokeWidth={1.5} />
        </svg>
        <svg width={size} height={size}>
          <path d={plainCirclePath(c, c - 8)} fill="none" stroke="#2563eb" strokeWidth={2} />
        </svg>
      </div>
    );
  },
};
