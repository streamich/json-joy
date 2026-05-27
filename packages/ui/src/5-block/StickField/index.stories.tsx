import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {InputNumber} from '../../2-inline-block/InputNumber';
import {StickField} from '.';

const meta: Meta<typeof StickField> = {
  title: '5. Block/StickField',
  component: StickField,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const frameStyle: React.CSSProperties = {
  height: 480,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const headingStyle: React.CSSProperties = {
  position: 'relative',
  margin: 0,
  fontSize: 48,
  fontWeight: 700,
  color: '#16161a',
};

export const Basic: StoryObj<typeof meta> = {
  render: () => (
    <StickField style={frameStyle}>
      <h1 style={headingStyle}>json-joy</h1>
    </StickField>
  ),
};

export const FollowsMouse: StoryObj<typeof meta> = {
  render: () => (
    <StickField reactToMouse followMouse style={frameStyle}>
      <h1 style={headingStyle}>Move your mouse</h1>
    </StickField>
  ),
};

export const RandomColors: StoryObj<typeof meta> = {
  render: () => <StickField color={{random: 1, wave: 0}} style={frameStyle} />,
};

export const MagneticField: StoryObj<typeof meta> = {
  render: () => <StickField magnetism={{base: 0.85, random: 0.15}} count={220} style={frameStyle} />,
};

export const VariedSizes: StoryObj<typeof meta> = {
  render: () => <StickField size={{base: 1, random: 0.7}} style={frameStyle} />,
};

export const SizeWave: StoryObj<typeof meta> = {
  render: () => <StickField size={{base: 1, wave: 0.7, waveFreq: 1.4, waveSpeed: 0.6}} style={frameStyle} />,
};

export const WiderSticks: StoryObj<typeof meta> = {
  render: () => <StickField thickness={{base: 3}} style={frameStyle} />,
};

export const ThicknessWave: StoryObj<typeof meta> = {
  render: () => <StickField thickness={{base: 2, wave: 1.6, waveFreq: 1.5, waveSpeed: 0.7}} style={frameStyle} />,
};

export const TwoActiveColors: StoryObj<typeof meta> = {
  render: () => <StickField colorActive={2} colorChangeSpeed={1.2} style={frameStyle} />,
};

export const FrontOnly: StoryObj<typeof meta> = {
  render: () => <StickField hideBack count={260} style={frameStyle} />,
};

export const Giant: StoryObj<typeof meta> = {
  render: () => <StickField radius={1.8} count={420} style={{...frameStyle, overflow: 'hidden'}} />,
};

export const Sheet: StoryObj<typeof meta> = {
  render: () => (
    <StickField
      hideBack
      flatten={0.7}
      count={420}
      distance={{wave: 0.35, waveSpeed: 0.5}}
      shapeOctaves={4}
      shapeSharpness={1.6}
      magnetism={{base: 0.6, random: 0.2}}
      style={frameStyle}
    />
  ),
};

export const EdgeFollow: StoryObj<typeof meta> = {
  render: () => (
    <StickField reactToMouse followMouse followStrength={1} followReach={1} style={frameStyle}>
      <h1 style={headingStyle}>Drag me to the edges</h1>
    </StickField>
  ),
};

export const Dense: StoryObj<typeof meta> = {
  render: () => (
    <StickField
      reactToMouse
      followMouse
      count={320}
      distance={{wave: 0.09}}
      size={{base: 0.9, wave: 0.5}}
      style={frameStyle}
    />
  ),
};

const panelStyle: React.CSSProperties = {
  width: 320,
  flex: '0 0 auto',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  overflowY: 'auto',
  maxHeight: '100vh',
  borderRight: '1px solid rgba(127,127,127,.2)',
};

const configButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 10px',
  fontSize: 12,
  cursor: 'pointer',
  borderRadius: 6,
  border: '1px solid rgba(127,127,127,.3)',
  background: 'transparent',
  color: 'inherit',
};

const configPreStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: 'pre',
  overflowX: 'auto',
  flex: '0 0 auto',
  borderRadius: 6,
  background: 'rgba(127,127,127,.1)',
};

const Knob: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}> = ({label, value, min, max, step, onChange}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
    <span style={{flex: '1 1 auto', minWidth: 0, opacity: 0.7}}>{label}</span>
    <InputNumber value={value} min={min} max={max} step={step} drag onChange={onChange} style={{flex: '0 0 150px'}} />
  </div>
);

const Toggle: React.FC<{label: string; value: boolean; onChange: (v: boolean) => void}> = ({
  label,
  value,
  onChange,
}) => (
  <label style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 12}}>
    <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

const PlaygroundDemo: React.FC = () => {
  const [count, setCount] = React.useState(720);
  const [radius, setRadius] = React.useState(0.78);
  const [stickLength, setStickLength] = React.useState(0.07);
  const [lineWidth, setLineWidth] = React.useState(3.8);
  const [sizeBase, setSizeBase] = React.useState(0.9);
  const [sizeRandom, setSizeRandom] = React.useState(0.35);
  const [sizeWave, setSizeWave] = React.useState(1.4);
  const [sizeFreq, setSizeFreq] = React.useState(0.8);
  const [sizeSpeed, setSizeSpeed] = React.useState(1.8);
  const [sizeMin, setSizeMin] = React.useState(0.15);
  const [sizeMax, setSizeMax] = React.useState(0.25);
  const [thickBase, setThickBase] = React.useState(2.85);
  const [thickRandom, setThickRandom] = React.useState(0);
  const [thickWave, setThickWave] = React.useState(1.3);
  const [thickFreq, setThickFreq] = React.useState(1.8);
  const [thickSpeed, setThickSpeed] = React.useState(2.8);
  const [thickMin, setThickMin] = React.useState(3.55);
  const [thickMax, setThickMax] = React.useState(8);
  const [distWave, setDistWave] = React.useState(0.1);
  const [distSpeed, setDistSpeed] = React.useState(4.2);
  const [shapeOctaves, setShapeOctaves] = React.useState(3);
  const [shapeRoughness, setShapeRoughness] = React.useState(0.75);
  const [shapeSharpness, setShapeSharpness] = React.useState(1);
  const [pulse, setPulse] = React.useState(0.04);
  const [pulseSpeed, setPulseSpeed] = React.useState(0.75);
  const [flatten, setFlatten] = React.useState(0);
  const [colorWave, setColorWave] = React.useState(1.45);
  const [colorRandom, setColorRandom] = React.useState(0);
  const [colorSpeed, setColorSpeed] = React.useState(0.75);
  const [colorActive, setColorActive] = React.useState(3);
  const [colorChangeSpeed, setColorChangeSpeed] = React.useState(2.45);
  const [magBase, setMagBase] = React.useState(0.8);
  const [magRandom, setMagRandom] = React.useState(0.05);
  const [yawSpeed, setYawSpeed] = React.useState(0.38);
  const [perspective, setPerspective] = React.useState(4.2);
  const [tiltMax, setTiltMax] = React.useState(0.65);
  const [hideBack, setHideBack] = React.useState(false);
  const [cullDepth, setCullDepth] = React.useState(0.35);
  const [reactToMouse, setReactToMouse] = React.useState(true);
  const [followMouse, setFollowMouse] = React.useState(true);
  const [followStrength, setFollowStrength] = React.useState(0.6);
  const [followReach, setFollowReach] = React.useState(1.2);
  const [showConfig, setShowConfig] = React.useState(false);

  const config =
    `<StickField\n` +
    `  count={${count}}\n` +
    `  radius={${radius}}\n` +
    `  stickLength={${stickLength}}\n` +
    `  lineWidth={${lineWidth}}\n` +
    `  size={{base: ${sizeBase}, random: ${sizeRandom}, wave: ${sizeWave}, waveFreq: ${sizeFreq}, waveSpeed: ${sizeSpeed}, min: ${sizeMin}, max: ${sizeMax}}}\n` +
    `  thickness={{base: ${thickBase}, random: ${thickRandom}, wave: ${thickWave}, waveFreq: ${thickFreq}, waveSpeed: ${thickSpeed}, min: ${thickMin}, max: ${thickMax}}}\n` +
    `  distance={{wave: ${distWave}, waveSpeed: ${distSpeed}}}\n` +
    `  shapeOctaves={${shapeOctaves}}\n` +
    `  shapeRoughness={${shapeRoughness}}\n` +
    `  shapeSharpness={${shapeSharpness}}\n` +
    `  pulse={${pulse}}\n` +
    `  pulseSpeed={${pulseSpeed}}\n` +
    `  flatten={${flatten}}\n` +
    `  color={{wave: ${colorWave}, random: ${colorRandom}, waveSpeed: ${colorSpeed}}}\n` +
    `  colorActive={${colorActive}}\n` +
    `  colorChangeSpeed={${colorChangeSpeed}}\n` +
    `  magnetism={{base: ${magBase}, random: ${magRandom}}}\n` +
    `  yawSpeed={${yawSpeed}}\n` +
    `  perspective={${perspective}}\n` +
    `  hideBack={${hideBack}}\n` +
    `  cullDepth={${cullDepth}}\n` +
    `  tiltMax={${tiltMax}}\n` +
    `  reactToMouse={${reactToMouse}}\n` +
    `  followMouse={${followMouse}}\n` +
    `  followStrength={${followStrength}}\n` +
    `  followReach={${followReach}}\n` +
    `/>`;

  return (
    <div style={{display: 'flex', alignItems: 'stretch', height: '100vh'}}>
      <div style={panelStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <button type="button" onClick={() => setShowConfig((v) => !v)} style={configButtonStyle}>
            {showConfig ? 'Hide config' : 'Show config'}
          </button>
          <CopyButton onCopy={() => config} />
        </div>
        {showConfig && <pre style={configPreStyle}>{config}</pre>}
        <strong style={{fontSize: 13}}>Sphere</strong>
        <Knob label="count" value={count} min={10} max={2000} step={10} onChange={setCount} />
        <Knob label="radius (blob size)" value={radius} min={0.1} max={12} step={0.05} onChange={setRadius} />
        <Knob label="perspective" value={perspective} min={1.2} max={20} step={0.1} onChange={setPerspective} />
        <Knob label="yaw speed" value={yawSpeed} min={-2} max={2} step={0.02} onChange={setYawSpeed} />
        <Toggle label="hideBack (front only)" value={hideBack} onChange={setHideBack} />
        <Knob label="cull depth" value={cullDepth} min={-1} max={1} step={0.05} onChange={setCullDepth} />
        <strong style={{fontSize: 13, marginTop: 8}}>Size (length + width)</strong>
        <Knob label="stick length" value={stickLength} min={0.01} max={0.5} step={0.005} onChange={setStickLength} />
        <Knob label="base" value={sizeBase} min={0} max={6} step={0.05} onChange={setSizeBase} />
        <Knob label="random" value={sizeRandom} min={0} max={4} step={0.05} onChange={setSizeRandom} />
        <Knob label="wave" value={sizeWave} min={0} max={12} step={0.05} onChange={setSizeWave} />
        <Knob label="wave freq" value={sizeFreq} min={0} max={12} step={0.1} onChange={setSizeFreq} />
        <Knob label="wave speed" value={sizeSpeed} min={0} max={4} step={0.05} onChange={setSizeSpeed} />
        <Knob label="min" value={sizeMin} min={0} max={6} step={0.05} onChange={setSizeMin} />
        <Knob label="max" value={sizeMax} min={0} max={12} step={0.05} onChange={setSizeMax} />
        <strong style={{fontSize: 13, marginTop: 8}}>Thickness (width only)</strong>
        <Knob label="line width" value={lineWidth} min={0.2} max={12} step={0.1} onChange={setLineWidth} />
        <Knob label="base" value={thickBase} min={0} max={8} step={0.05} onChange={setThickBase} />
        <Knob label="random" value={thickRandom} min={0} max={6} step={0.05} onChange={setThickRandom} />
        <Knob label="wave" value={thickWave} min={0} max={6} step={0.05} onChange={setThickWave} />
        <Knob label="wave freq" value={thickFreq} min={0} max={12} step={0.1} onChange={setThickFreq} />
        <Knob label="wave speed" value={thickSpeed} min={0} max={4} step={0.05} onChange={setThickSpeed} />
        <Knob label="min" value={thickMin} min={0} max={8} step={0.05} onChange={setThickMin} />
        <Knob label="max" value={thickMax} min={0} max={16} step={0.05} onChange={setThickMax} />
        <strong style={{fontSize: 13, marginTop: 8}}>Shape (breathing)</strong>
        <Knob label="wave" value={distWave} min={0} max={1.5} step={0.01} onChange={setDistWave} />
        <Knob label="wave speed" value={distSpeed} min={0} max={6} step={0.05} onChange={setDistSpeed} />
        <Knob label="octaves" value={shapeOctaves} min={1} max={6} step={1} onChange={setShapeOctaves} />
        <Knob label="roughness" value={shapeRoughness} min={0} max={1} step={0.05} onChange={setShapeRoughness} />
        <Knob label="sharpness" value={shapeSharpness} min={0.2} max={5} step={0.1} onChange={setShapeSharpness} />
        <Knob label="pulse" value={pulse} min={0} max={1} step={0.02} onChange={setPulse} />
        <Knob label="pulse speed" value={pulseSpeed} min={0} max={4} step={0.05} onChange={setPulseSpeed} />
        <Knob label="flatten (sheet)" value={flatten} min={0} max={1} step={0.05} onChange={setFlatten} />
        <strong style={{fontSize: 13, marginTop: 8}}>Color</strong>
        <Knob label="active colors" value={colorActive} min={0} max={6} step={1} onChange={setColorActive} />
        <Knob
          label="change speed"
          value={colorChangeSpeed}
          min={0}
          max={6}
          step={0.05}
          onChange={setColorChangeSpeed}
        />
        <Knob label="wave" value={colorWave} min={0} max={6} step={0.05} onChange={setColorWave} />
        <Knob label="random" value={colorRandom} min={0} max={3} step={0.05} onChange={setColorRandom} />
        <Knob label="wave speed" value={colorSpeed} min={0} max={4} step={0.05} onChange={setColorSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Magnetism</strong>
        <Knob label="base" value={magBase} min={0} max={1} step={0.05} onChange={setMagBase} />
        <Knob label="random" value={magRandom} min={0} max={1} step={0.05} onChange={setMagRandom} />
        <strong style={{fontSize: 13, marginTop: 8}}>Pointer</strong>
        <Knob label="tilt max" value={tiltMax} min={0} max={3} step={0.05} onChange={setTiltMax} />
        <Toggle label="reactToMouse (tilt)" value={reactToMouse} onChange={setReactToMouse} />
        <Toggle label="followMouse (drift)" value={followMouse} onChange={setFollowMouse} />
        <Knob
          label="follow strength"
          value={followStrength}
          min={0}
          max={1.5}
          step={0.05}
          onChange={setFollowStrength}
        />
        <Knob label="follow reach" value={followReach} min={0} max={2} step={0.05} onChange={setFollowReach} />
      </div>
      <StickField
        count={count}
        radius={radius}
        stickLength={stickLength}
        lineWidth={lineWidth}
        size={{
          base: sizeBase,
          random: sizeRandom,
          wave: sizeWave,
          waveFreq: sizeFreq,
          waveSpeed: sizeSpeed,
          min: sizeMin,
          max: sizeMax,
        }}
        thickness={{
          base: thickBase,
          random: thickRandom,
          wave: thickWave,
          waveFreq: thickFreq,
          waveSpeed: thickSpeed,
          min: thickMin,
          max: thickMax,
        }}
        distance={{wave: distWave, waveSpeed: distSpeed}}
        shapeOctaves={shapeOctaves}
        shapeRoughness={shapeRoughness}
        shapeSharpness={shapeSharpness}
        pulse={pulse}
        pulseSpeed={pulseSpeed}
        flatten={flatten}
        color={{wave: colorWave, random: colorRandom, waveSpeed: colorSpeed}}
        colorActive={colorActive}
        colorChangeSpeed={colorChangeSpeed}
        magnetism={{base: magBase, random: magRandom}}
        yawSpeed={yawSpeed}
        perspective={perspective}
        hideBack={hideBack}
        cullDepth={cullDepth}
        tiltMax={tiltMax}
        reactToMouse={reactToMouse}
        followMouse={followMouse}
        followStrength={followStrength}
        followReach={followReach}
        style={{flex: 1, height: '100%'}}
      />
    </div>
  );
};

export const Playground: StoryObj<typeof meta> = {
  render: () => <PlaygroundDemo />,
};

// Nice designs
/*
<StickField
  count={640}
  radius={1.05}
  stickLength={0.07}
  lineWidth={3.8}
  size={{base: 0.9, random: 0.35, wave: 1.4, waveFreq: 0.8, waveSpeed: 1.8, min: 0.15, max: 0.25}}
  thickness={{base: 2.85, random: 0, wave: 1.3, waveFreq: 1.8, waveSpeed: 2.8, min: 2.55, max: 8}}
  distance={{wave: 0.18, waveSpeed: 3.2}}
  shapeOctaves={3}
  shapeRoughness={0.75}
  shapeSharpness={1}
  pulse={0.04}
  pulseSpeed={0.75}
  flatten={0}
  color={{wave: 1.45, random: 0, waveSpeed: 0.75}}
  colorActive={4}
  colorChangeSpeed={2.45}
  magnetism={{base: 1, random: 0}}
  yawSpeed={0.38}
  perspective={4.2}
  hideBack={false}
  cullDepth={0.35}
  tiltMax={0.65}
  reactToMouse={true}
  followMouse={true}
  followStrength={0.6}
  followReach={1.2}
/>

<StickField
  count={720}
  radius={0.78}
  stickLength={0.07}
  lineWidth={3.8}
  size={{base: 0.9, random: 0.35, wave: 1.4, waveFreq: 0.8, waveSpeed: 1.8, min: 0.15, max: 0.25}}
  thickness={{base: 2.85, random: 0, wave: 1.3, waveFreq: 1.8, waveSpeed: 2.8, min: 3.55, max: 8}}
  distance={{wave: 0.1, waveSpeed: 4.2}}
  shapeOctaves={3}
  shapeRoughness={0.75}
  shapeSharpness={1}
  pulse={0.04}
  pulseSpeed={0.75}
  flatten={0}
  color={{wave: 1.45, random: 0, waveSpeed: 0.75}}
  colorActive={3}
  colorChangeSpeed={2.45}
  magnetism={{base: 0.8, random: 0.05}}
  yawSpeed={0.38}
  perspective={4.2}
  hideBack={false}
  cullDepth={0.35}
  tiltMax={0.65}
  reactToMouse={true}
  followMouse={true}
  followStrength={0.6}
  followReach={1.2}
/>
 */
