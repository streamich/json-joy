import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {InputNumber} from '../../2-inline-block/InputNumber';
import {StickFieldWebGl} from '.';

const meta: Meta<typeof StickFieldWebGl> = {
  title: '5. Block/StickField (WebGL)',
  component: StickFieldWebGl,
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
    <StickFieldWebGl style={frameStyle}>
      <h1 style={headingStyle}>json-joy</h1>
    </StickFieldWebGl>
  ),
};

export const FollowsMouse: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl config={{reactToMouse: true, followMouse: true}} style={frameStyle}>
      <h1 style={headingStyle}>Move your mouse</h1>
    </StickFieldWebGl>
  ),
};

export const RandomColors: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{color: {random: 1, wave: 0}}} style={frameStyle} />,
};

export const MagneticField: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{magnetism: {base: 0.85, random: 0.15}, count: 220}} style={frameStyle} />,
};

export const VariedSizes: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{size: {base: 1, random: 0.7}}} style={frameStyle} />,
};

export const SizeWave: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl config={{size: {base: 1, wave: 0.7, waveFreq: 1.4, waveSpeed: 0.6}}} style={frameStyle} />
  ),
};

export const WiderSticks: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{thickness: {base: 3}}} style={frameStyle} />,
};

export const ThicknessWave: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl config={{thickness: {base: 2, wave: 1.6, waveFreq: 1.5, waveSpeed: 0.7}}} style={frameStyle} />
  ),
};

export const Squares: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{rounding: 0, count: 200, stickLength: 0.05, lineWidth: 7, thickness: {base: 1}, magnetism: {base: 0.4}}}
      style={frameStyle}
    />
  ),
};

export const TwoActiveColors: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{colorActive: 2, colorChangeSpeed: 1.2}} style={frameStyle} />,
};

export const FrontOnly: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{hideBack: true, count: 260}} style={frameStyle} />,
};

export const Giant: StoryObj<typeof meta> = {
  render: () => <StickFieldWebGl config={{radius: 1.8, count: 420}} style={{...frameStyle, overflow: 'hidden'}} />,
};

export const Sheet: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{
        hideBack: true,
        flatten: 0.7,
        count: 420,
        distance: {wave: 0.35, waveSpeed: 0.5},
        shapeOctaves: 4,
        shapeSharpness: 1.6,
        magnetism: {base: 0.6, random: 0.2},
      }}
      style={frameStyle}
    />
  ),
};

export const EdgeFollow: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{reactToMouse: true, followMouse: true, followStrength: 1, followReach: 1}}
      style={frameStyle}
    >
      <h1 style={headingStyle}>Drag me to the edges</h1>
    </StickFieldWebGl>
  ),
};

export const MouseRepel: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{mouseRepel: true, count: 600, repelRadius: 150, repelStrength: 1, magnetism: {base: 0.3, random: 0.2}}}
      style={frameStyle}
    >
      <h1 style={headingStyle}>Push the sticks</h1>
    </StickFieldWebGl>
  ),
};

export const DipoleField: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{field: 'dipole', fieldAxis: [0, 1, 0], magnetism: {base: 0.9, random: 0.1}, count: 700}}
      style={frameStyle}
    />
  ),
};

// Thin alpha-gradient rays from every stick to the center of attraction.
export const Rays: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{rays: true, count: 600, rayAlpha: 0.3, magnetism: {base: 0.2, random: 0.2}}}
      style={frameStyle}
    />
  ),
};

// The convergence point wanders, dragging the ray fan with it.
export const DriftingCenter: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{rays: true, centerDrift: 0.55, centerDriftSpeed: 0.3, count: 600, rayAlpha: 0.32}}
      style={frameStyle}
    />
  ),
};

// Additive blending plus a slow twinkle reads as a glowing nebula.
export const Glow: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl
      config={{glow: true, twinkle: 0.5, count: 2000, lineWidth: 1.3, stickLength: 0.05}}
      style={frameStyle}
    />
  ),
};

// Far past the 2D version's comfortable range: a single instanced draw per frame.
export const HundredThousand: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGl config={{count: 120000, radius: 1.1, stickLength: 0.05, lineWidth: 1.2}} style={frameStyle}>
      <h1 style={headingStyle}>120k sticks</h1>
    </StickFieldWebGl>
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
  const [rounding, setRounding] = React.useState(1);
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
  const [mouseRepel, setMouseRepel] = React.useState(false);
  const [repelRadius, setRepelRadius] = React.useState(120);
  const [repelStrength, setRepelStrength] = React.useState(1);
  const [dipole, setDipole] = React.useState(false);
  const [fieldWobble, setFieldWobble] = React.useState(0);
  const [centerDrift, setCenterDrift] = React.useState(0);
  const [rays, setRays] = React.useState(false);
  const [rayWidth, setRayWidth] = React.useState(0.6);
  const [rayAlpha, setRayAlpha] = React.useState(0.25);
  const [glow, setGlow] = React.useState(false);
  const [twinkle, setTwinkle] = React.useState(0);
  const [showConfig, setShowConfig] = React.useState(false);

  const config = React.useMemo(
    () => ({
      count,
      radius,
      stickLength,
      lineWidth,
      rounding,
      size: {
        base: sizeBase,
        random: sizeRandom,
        wave: sizeWave,
        waveFreq: sizeFreq,
        waveSpeed: sizeSpeed,
        min: sizeMin,
        max: sizeMax,
      },
      thickness: {
        base: thickBase,
        random: thickRandom,
        wave: thickWave,
        waveFreq: thickFreq,
        waveSpeed: thickSpeed,
        min: thickMin,
        max: thickMax,
      },
      distance: {wave: distWave, waveSpeed: distSpeed},
      shapeOctaves,
      shapeRoughness,
      shapeSharpness,
      pulse,
      pulseSpeed,
      flatten,
      color: {wave: colorWave, random: colorRandom, waveSpeed: colorSpeed},
      colorActive,
      colorChangeSpeed,
      magnetism: {base: magBase, random: magRandom},
      yawSpeed,
      perspective,
      hideBack,
      cullDepth,
      tiltMax,
      reactToMouse,
      followMouse,
      followStrength,
      followReach,
      mouseRepel,
      repelRadius,
      repelStrength,
      field: dipole ? ('dipole' as const) : ('radial' as const),
      fieldWobble,
      centerDrift,
      rays,
      rayWidth,
      rayAlpha,
      glow,
      twinkle,
    }),
    [
      count,
      radius,
      stickLength,
      lineWidth,
      rounding,
      sizeBase,
      sizeRandom,
      sizeWave,
      sizeFreq,
      sizeSpeed,
      sizeMin,
      sizeMax,
      thickBase,
      thickRandom,
      thickWave,
      thickFreq,
      thickSpeed,
      thickMin,
      thickMax,
      distWave,
      distSpeed,
      shapeOctaves,
      shapeRoughness,
      shapeSharpness,
      pulse,
      pulseSpeed,
      flatten,
      colorWave,
      colorRandom,
      colorSpeed,
      colorActive,
      colorChangeSpeed,
      magBase,
      magRandom,
      yawSpeed,
      perspective,
      tiltMax,
      hideBack,
      cullDepth,
      reactToMouse,
      followMouse,
      followStrength,
      followReach,
      mouseRepel,
      repelRadius,
      repelStrength,
      dipole,
      fieldWobble,
      centerDrift,
      rays,
      rayWidth,
      rayAlpha,
      glow,
      twinkle,
    ],
  );

  const code = JSON.stringify(config, null, 2).replace(/\n/g, '\n  ');

  return (
    <div style={{display: 'flex', alignItems: 'stretch', height: '100vh'}}>
      <div style={panelStyle}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <button type="button" onClick={() => setShowConfig((v) => !v)} style={configButtonStyle}>
            {showConfig ? 'Hide config' : 'Show config'}
          </button>
          <CopyButton onCopy={() => code} />
        </div>
        {showConfig && <pre style={configPreStyle}>{code}</pre>}
        <strong style={{fontSize: 13}}>Sphere</strong>
        <Knob label="count" value={count} min={10} max={200000} step={10} onChange={setCount} />
        <Knob label="radius (blob size)" value={radius} min={0.1} max={12} step={0.05} onChange={setRadius} />
        <Knob label="perspective" value={perspective} min={1.2} max={20} step={0.1} onChange={setPerspective} />
        <Knob label="yaw speed" value={yawSpeed} min={-2} max={2} step={0.02} onChange={setYawSpeed} />
        <Toggle label="hideBack (front only)" value={hideBack} onChange={setHideBack} />
        <Knob label="cull depth" value={cullDepth} min={-1} max={1} step={0.05} onChange={setCullDepth} />
        <strong style={{fontSize: 13, marginTop: 8}}>Size (length + width)</strong>
        <Knob label="stick length" value={stickLength} min={0.01} max={0.5} step={0.005} onChange={setStickLength} />
        <Knob
          label="rounding (1 round, 0 square)"
          value={rounding}
          min={0}
          max={1}
          step={0.05}
          onChange={setRounding}
        />
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
        <strong style={{fontSize: 13, marginTop: 8}}>Magnetism / field</strong>
        <Knob label="base" value={magBase} min={0} max={1} step={0.05} onChange={setMagBase} />
        <Knob label="random" value={magRandom} min={0} max={1} step={0.05} onChange={setMagRandom} />
        <Toggle label="dipole field" value={dipole} onChange={setDipole} />
        <Knob label="field wobble" value={fieldWobble} min={0} max={1} step={0.05} onChange={setFieldWobble} />
        <strong style={{fontSize: 13, marginTop: 8}}>Center + rays</strong>
        <Knob label="center drift" value={centerDrift} min={0} max={1.5} step={0.05} onChange={setCenterDrift} />
        <Toggle label="rays" value={rays} onChange={setRays} />
        <Knob label="ray width (px)" value={rayWidth} min={0.2} max={4} step={0.1} onChange={setRayWidth} />
        <Knob label="ray alpha" value={rayAlpha} min={0} max={1} step={0.02} onChange={setRayAlpha} />
        <strong style={{fontSize: 13, marginTop: 8}}>Glow + twinkle</strong>
        <Toggle label="glow (additive)" value={glow} onChange={setGlow} />
        <Knob label="twinkle" value={twinkle} min={0} max={1} step={0.05} onChange={setTwinkle} />
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
        <Toggle label="mouseRepel (local push)" value={mouseRepel} onChange={setMouseRepel} />
        <Knob label="repel radius (px)" value={repelRadius} min={20} max={400} step={5} onChange={setRepelRadius} />
        <Knob label="repel strength" value={repelStrength} min={0} max={3} step={0.05} onChange={setRepelStrength} />
      </div>
      <StickFieldWebGl config={config} style={{flex: 1, height: '100%'}} />
    </div>
  );
};

export const Playground: StoryObj<typeof meta> = {
  render: () => <PlaygroundDemo />,
};
