import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {InputNumber} from '../../2-inline-block/InputNumber';
import {SheetFieldWebGpu} from '.';
import {
  ambient,
  behindCard,
  cardFooter,
  DEFAULT_CONFIG,
  heroSheet,
  nebula,
  palette,
  PRESETS,
  resolvePreset,
  scrollReactive,
  silk,
} from './presets';
import type {SheetFieldOptions} from './types';

const meta: Meta<typeof SheetFieldWebGpu> = {
  title: '5. Block/SheetField (WebGPU)',
  component: SheetFieldWebGpu,
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

const headingDark: React.CSSProperties = {...headingStyle, color: '#f6f6fb'};

const presetStory = (
  config: SheetFieldOptions,
  opts: {dark?: boolean; label?: string} = {},
): StoryObj<typeof meta> => ({
  render: () => (
    <SheetFieldWebGpu
      config={resolvePreset(config)}
      style={opts.dark ? {...frameStyle, background: '#0a0a12'} : frameStyle}
    >
      {opts.label ? <h1 style={opts.dark ? headingDark : headingStyle}>{opts.label}</h1> : null}
    </SheetFieldWebGpu>
  ),
});

export const Default: StoryObj<typeof meta> = presetStory({}, {label: 'json-joy'});
export const HeroSheet: StoryObj<typeof meta> = presetStory(heroSheet, {label: 'Build with json-joy'});
export const Silk: StoryObj<typeof meta> = presetStory(silk, {label: 'Your content'});
export const Nebula: StoryObj<typeof meta> = presetStory(nebula, {dark: true});
export const Palette: StoryObj<typeof meta> = presetStory(palette);
export const Ambient: StoryObj<typeof meta> = presetStory(ambient);
export const CardFooter: StoryObj<typeof meta> = presetStory(cardFooter);
export const BehindCard: StoryObj<typeof meta> = presetStory(behindCard, {label: 'Your content'});

export const Massive: StoryObj<typeof meta> = {
  render: () => (
    <SheetFieldWebGpu config={resolvePreset({segments: 600, columns: 140})} style={{...frameStyle, overflow: 'hidden'}}>
      <h1 style={headingStyle}>600 x 140</h1>
    </SheetFieldWebGpu>
  ),
};

export const ScrollReactive: StoryObj<typeof meta> = {
  render: () => (
    <div style={{height: '300vh', position: 'relative'}}>
      <div style={{position: 'sticky', top: 0, height: '100vh'}}>
        <SheetFieldWebGpu
          config={resolvePreset(scrollReactive)}
          style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <h1 style={headingStyle}>Scroll the page</h1>
        </SheetFieldWebGpu>
      </div>
    </div>
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

const fmtVal = (v: unknown): string => {
  if (Array.isArray(v)) return `[${v.map(fmtVal).join(', ')}]`;
  if (v && typeof v === 'object')
    return `{${Object.entries(v)
      .map(([k, x]) => `${k}: ${fmtVal(x)}`)
      .join(', ')}}`;
  if (typeof v === 'string') return `'${v}'`;
  return String(v);
};
const serializeConfig = (conf: SheetFieldOptions): string =>
  `{\n${Object.entries(conf)
    .map(([k, v]) => `  ${k}: ${fmtVal(v)},`)
    .join('\n')}\n}`;

const D = DEFAULT_CONFIG;
const DC = D.color ?? {};
const DF = D.forward ?? [1, 0, 0.5];
const DL = D.lightDir ?? [0.2, 0.6, 0.7];

const PlaygroundDemo: React.FC = () => {
  const [segments, setSegments] = React.useState(D.segments ?? 320);
  const [columns, setColumns] = React.useState(D.columns ?? 64);
  const [length, setLength] = React.useState(D.length ?? 3.4);
  const [width, setWidth] = React.useState(D.width ?? 1.5);
  const [forwardX, setForwardX] = React.useState(DF[0]);
  const [forwardY, setForwardY] = React.useState(DF[1]);
  const [forwardZ, setForwardZ] = React.useState(DF[2]);
  const [tilt, setTilt] = React.useState(D.tilt ?? 0.45);
  const [taper, setTaper] = React.useState(D.taper ?? 0.12);
  const [twistBase, setTwistBase] = React.useState(D.twistBase ?? 0);
  const [twistTurns, setTwistTurns] = React.useState(D.twistTurns ?? 0.55);
  const [twistWave, setTwistWave] = React.useState(D.twistWave ?? 0.12);
  const [twistFreq, setTwistFreq] = React.useState(D.twistFreq ?? 2);
  const [twistSpeed, setTwistSpeed] = React.useState(D.twistSpeed ?? 0.2);
  const [foldAmp, setFoldAmp] = React.useState(D.foldAmp ?? 0.3);
  const [foldLateral, setFoldLateral] = React.useState(D.foldLateral ?? 0.08);
  const [foldFreq, setFoldFreq] = React.useState(D.foldFreq ?? 1.3);
  const [foldSpeed, setFoldSpeed] = React.useState(D.foldSpeed ?? 0.3);
  const [shapeOctaves, setShapeOctaves] = React.useState(D.shapeOctaves ?? 3);
  const [shapeRoughness, setShapeRoughness] = React.useState(D.shapeRoughness ?? 0.6);
  const [flowScale, setFlowScale] = React.useState(D.flowScale ?? 1);
  const [pulse, setPulse] = React.useState(D.pulse ?? 0);
  const [pulseSpeed, setPulseSpeed] = React.useState(D.pulseSpeed ?? 0.5);
  const [colorMode, setColorMode] = React.useState<'gradient' | 'palette'>(D.colorMode ?? 'gradient');
  const [colorAlong, setColorAlong] = React.useState(D.colorAlong ?? 0.9);
  const [colorAcross, setColorAcross] = React.useState(D.colorAcross ?? 0.12);
  const [colorActive, setColorActive] = React.useState(D.colorActive ?? 4);
  const [colorChangeSpeed, setColorChangeSpeed] = React.useState(D.colorChangeSpeed ?? 1);
  const [colorWave, setColorWave] = React.useState(DC.wave ?? 0.05);
  const [colorFreq, setColorFreq] = React.useState(DC.waveFreq ?? 0.8);
  const [colorSpeed, setColorSpeed] = React.useState(DC.waveSpeed ?? 0.2);
  const [fibers, setFibers] = React.useState(D.fibers ?? true);
  const [fiberCount, setFiberCount] = React.useState(D.fiberCount ?? 220);
  const [fiberContrast, setFiberContrast] = React.useState(D.fiberContrast ?? 0.35);
  const [fiberShear, setFiberShear] = React.useState(D.fiberShear ?? 0.3);
  const [fiberDrift, setFiberDrift] = React.useState(D.fiberDrift ?? 0.03);
  const [fiberSharpness, setFiberSharpness] = React.useState(D.fiberSharpness ?? 4);
  const [fiberJitter, setFiberJitter] = React.useState(D.fiberJitter ?? 0.45);
  const [fiberVariation, setFiberVariation] = React.useState(D.fiberVariation ?? 0.55);
  const [fiberGaps, setFiberGaps] = React.useState(D.fiberGaps ?? 0.3);
  const [fiberGlint, setFiberGlint] = React.useState(D.fiberGlint ?? 0.5);
  const [style, setStyle] = React.useState<'fill' | 'lines' | 'dots'>(D.style ?? 'fill');
  const [lineCount, setLineCount] = React.useState(D.lineCount ?? 40);
  const [lineWidth, setLineWidth] = React.useState(D.lineWidth ?? 0.5);
  const [lineShear, setLineShear] = React.useState(D.lineShear ?? 0);
  const [dotCount, setDotCount] = React.useState(D.dotCount ?? 60);
  const [dotWidth, setDotWidth] = React.useState(D.dotWidth ?? 0.5);
  const [light, setLight] = React.useState(D.light ?? true);
  const [ambientAmt, setAmbientAmt] = React.useState(D.ambient ?? 0.36);
  const [diffuse, setDiffuse] = React.useState(D.diffuse ?? 0.5);
  const [specular, setSpecular] = React.useState(D.specular ?? 0.35);
  const [shininess, setShininess] = React.useState(D.shininess ?? 22);
  const [rim, setRim] = React.useState(D.rim ?? 0.2);
  const [rimPower, setRimPower] = React.useState(D.rimPower ?? 3);
  const [lightDirX, setLightDirX] = React.useState(DL[0]);
  const [lightDirY, setLightDirY] = React.useState(DL[1]);
  const [lightDirZ, setLightDirZ] = React.useState(DL[2]);
  const [lightFollowsMouse, setLightFollowsMouse] = React.useState(D.lightFollowsMouse ?? false);
  const [fog, setFog] = React.useState(D.fog ?? 0);
  const [glow, setGlow] = React.useState(D.glow ?? 0);
  const [vignette, setVignette] = React.useState(D.vignette ?? 0.1);
  const [opacity, setOpacity] = React.useState(D.opacity ?? 1);
  const [additive, setAdditive] = React.useState(D.additive ?? false);
  const [yawSpeed, setYawSpeed] = React.useState(D.yawSpeed ?? 0.05);
  const [pitchAmp, setPitchAmp] = React.useState(D.pitchAmp ?? 0.05);
  const [pitchSpeed, setPitchSpeed] = React.useState(D.pitchSpeed ?? 0.2);
  const [perspective, setPerspective] = React.useState(D.perspective ?? 7);
  const [radius, setRadius] = React.useState(D.radius ?? 1);
  const [originX, setOriginX] = React.useState((D.origin ?? [0.5, 0.5])[0]);
  const [originY, setOriginY] = React.useState((D.origin ?? [0.5, 0.5])[1]);
  const [centerDrift, setCenterDrift] = React.useState(D.centerDrift ?? 0);
  const [centerDriftSpeed, setCenterDriftSpeed] = React.useState(D.centerDriftSpeed ?? 0.4);
  const [reactToMouse, setReactToMouse] = React.useState(D.reactToMouse ?? false);
  const [tiltMax, setTiltMax] = React.useState(D.tiltMax ?? 0.3);
  const [followMouse, setFollowMouse] = React.useState(D.followMouse ?? false);
  const [followStrength, setFollowStrength] = React.useState(D.followStrength ?? 0.5);
  const [followReach, setFollowReach] = React.useState(D.followReach ?? 0.6);
  const [bendMouse, setBendMouse] = React.useState(D.bendMouse ?? false);
  const [bendRadius, setBendRadius] = React.useState(D.bendRadius ?? 160);
  const [bendStrength, setBendStrength] = React.useState(D.bendStrength ?? 50);
  const [showConfig, setShowConfig] = React.useState(false);
  const [presetIdx, setPresetIdx] = React.useState(0);

  // Load a preset into all the knobs. Non-knob fields (colors, specColor,
  // fogColor) are not represented here.
  const applyPreset = (i: number): void => {
    setPresetIdx(i);
    const c = resolvePreset(PRESETS[i].config);
    const cl = c.color ?? {};
    setSegments(c.segments ?? 0);
    setColumns(c.columns ?? 0);
    setLength(c.length ?? 0);
    setWidth(c.width ?? 0);
    setForwardX((c.forward ?? [1, 0, 0.5])[0]);
    setForwardY((c.forward ?? [1, 0, 0.5])[1]);
    setForwardZ((c.forward ?? [1, 0, 0.5])[2]);
    setTilt(c.tilt ?? 0);
    setTaper(c.taper ?? 0);
    setTwistBase(c.twistBase ?? 0);
    setTwistTurns(c.twistTurns ?? 0);
    setTwistWave(c.twistWave ?? 0);
    setTwistFreq(c.twistFreq ?? 0);
    setTwistSpeed(c.twistSpeed ?? 0);
    setFoldAmp(c.foldAmp ?? 0);
    setFoldLateral(c.foldLateral ?? 0);
    setFoldFreq(c.foldFreq ?? 0);
    setFoldSpeed(c.foldSpeed ?? 0);
    setShapeOctaves(c.shapeOctaves ?? 1);
    setShapeRoughness(c.shapeRoughness ?? 0);
    setFlowScale(c.flowScale ?? 1);
    setPulse(c.pulse ?? 0);
    setPulseSpeed(c.pulseSpeed ?? 0);
    setColorMode(c.colorMode ?? 'gradient');
    setColorAlong(c.colorAlong ?? 0);
    setColorAcross(c.colorAcross ?? 0);
    setColorActive(c.colorActive ?? 0);
    setColorChangeSpeed(c.colorChangeSpeed ?? 0);
    setColorWave(cl.wave ?? 0);
    setColorFreq(cl.waveFreq ?? 0);
    setColorSpeed(cl.waveSpeed ?? 0);
    setFibers(c.fibers ?? false);
    setFiberCount(c.fiberCount ?? 0);
    setFiberContrast(c.fiberContrast ?? 0);
    setFiberShear(c.fiberShear ?? 0);
    setFiberDrift(c.fiberDrift ?? 0);
    setFiberSharpness(c.fiberSharpness ?? 1);
    setFiberJitter(c.fiberJitter ?? 0);
    setFiberVariation(c.fiberVariation ?? 0);
    setFiberGaps(c.fiberGaps ?? 0);
    setFiberGlint(c.fiberGlint ?? 0);
    setStyle(c.style ?? 'fill');
    setLineCount(c.lineCount ?? 40);
    setLineWidth(c.lineWidth ?? 0.5);
    setLineShear(c.lineShear ?? 0);
    setDotCount(c.dotCount ?? 60);
    setDotWidth(c.dotWidth ?? 0.5);
    setLight(c.light ?? false);
    setAmbientAmt(c.ambient ?? 0);
    setDiffuse(c.diffuse ?? 0);
    setSpecular(c.specular ?? 0);
    setShininess(c.shininess ?? 1);
    setRim(c.rim ?? 0);
    setRimPower(c.rimPower ?? 1);
    setLightDirX((c.lightDir ?? [0.2, 0.6, 0.7])[0]);
    setLightDirY((c.lightDir ?? [0.2, 0.6, 0.7])[1]);
    setLightDirZ((c.lightDir ?? [0.2, 0.6, 0.7])[2]);
    setLightFollowsMouse(c.lightFollowsMouse ?? false);
    setFog(c.fog ?? 0);
    setGlow(c.glow ?? 0);
    setVignette(c.vignette ?? 0);
    setOpacity(c.opacity ?? 1);
    setAdditive(c.additive ?? false);
    setYawSpeed(c.yawSpeed ?? 0);
    setPitchAmp(c.pitchAmp ?? 0);
    setPitchSpeed(c.pitchSpeed ?? 0);
    setPerspective(c.perspective ?? 1);
    setRadius(c.radius ?? 0);
    setOriginX((c.origin ?? [0.5, 0.5])[0]);
    setOriginY((c.origin ?? [0.5, 0.5])[1]);
    setCenterDrift(c.centerDrift ?? 0);
    setCenterDriftSpeed(c.centerDriftSpeed ?? 0);
    setReactToMouse(c.reactToMouse ?? false);
    setTiltMax(c.tiltMax ?? 0);
    setFollowMouse(c.followMouse ?? false);
    setFollowStrength(c.followStrength ?? 0);
    setFollowReach(c.followReach ?? 0);
    setBendMouse(c.bendMouse ?? false);
    setBendRadius(c.bendRadius ?? 0);
    setBendStrength(c.bendStrength ?? 0);
  };

  const conf: SheetFieldOptions = {
    segments,
    columns,
    length,
    width,
    forward: [forwardX, forwardY, forwardZ],
    tilt,
    taper,
    twistBase,
    twistTurns,
    twistWave,
    twistFreq,
    twistSpeed,
    foldAmp,
    foldLateral,
    foldFreq,
    foldSpeed,
    shapeOctaves,
    shapeRoughness,
    flowScale,
    pulse,
    pulseSpeed,
    colorMode,
    color: {wave: colorWave, waveFreq: colorFreq, waveSpeed: colorSpeed},
    colorAlong,
    colorAcross,
    colorActive,
    colorChangeSpeed,
    fibers,
    fiberCount,
    fiberContrast,
    fiberShear,
    fiberDrift,
    fiberSharpness,
    fiberJitter,
    fiberVariation,
    fiberGaps,
    fiberGlint,
    style,
    lineCount,
    lineWidth,
    lineShear,
    dotCount,
    dotWidth,
    light,
    ambient: ambientAmt,
    diffuse,
    specular,
    shininess,
    rim,
    rimPower,
    lightDir: [lightDirX, lightDirY, lightDirZ],
    lightFollowsMouse,
    fog,
    glow,
    vignette,
    opacity,
    additive,
    yawSpeed,
    pitchAmp,
    pitchSpeed,
    perspective,
    radius,
    origin: [originX, originY],
    centerDrift,
    centerDriftSpeed,
    reactToMouse,
    tiltMax,
    followMouse,
    followStrength,
    followReach,
    bendMouse,
    bendRadius,
    bendStrength,
  };
  const config = serializeConfig(conf);

  return (
    <div style={{display: 'flex', alignItems: 'stretch', height: '100vh'}}>
      <div style={panelStyle}>
        <label style={{display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12}}>
          <span style={{opacity: 0.7}}>Preset</span>
          <select
            value={presetIdx}
            onChange={(e) => applyPreset(Number(e.target.value))}
            style={{...configButtonStyle, flex: 'none', padding: '6px 8px'}}
          >
            {PRESETS.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name} — {p.hint}
              </option>
            ))}
          </select>
        </label>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <button type="button" onClick={() => setShowConfig((v) => !v)} style={configButtonStyle}>
            {showConfig ? 'Hide config' : 'Show config'}
          </button>
          <CopyButton onCopy={() => config} />
        </div>
        {showConfig && <pre style={configPreStyle}>{config}</pre>}
        <strong style={{fontSize: 13}}>Sheet</strong>
        <Knob label="segments" value={segments} min={8} max={800} step={8} onChange={setSegments} />
        <Knob label="columns" value={columns} min={4} max={300} step={4} onChange={setColumns} />
        <Knob label="length" value={length} min={0.5} max={20} step={0.1} onChange={setLength} />
        <Knob label="width" value={width} min={0.2} max={5} step={0.1} onChange={setWidth} />
        <Knob label="forward x" value={forwardX} min={-2} max={2} step={0.05} onChange={setForwardX} />
        <Knob label="forward y" value={forwardY} min={-2} max={2} step={0.05} onChange={setForwardY} />
        <Knob label="forward z" value={forwardZ} min={-2} max={2} step={0.05} onChange={setForwardZ} />
        <Knob label="tilt (edge-on -> top)" value={tilt} min={0} max={5} step={0.02} onChange={setTilt} />
        <Knob label="taper (edge fade)" value={taper} min={0} max={0.5} step={0.01} onChange={setTaper} />
        <Knob label="radius (scale)" value={radius} min={0.2} max={4} step={0.05} onChange={setRadius} />
        <Knob label="origin x" value={originX} min={-0.5} max={1.5} step={0.02} onChange={setOriginX} />
        <Knob label="origin y" value={originY} min={-0.5} max={1.5} step={0.02} onChange={setOriginY} />
        <Knob label="perspective" value={perspective} min={2} max={24} step={0.2} onChange={setPerspective} />
        <strong style={{fontSize: 13, marginTop: 8}}>Slide twist</strong>
        <Knob label="base" value={twistBase} min={-2} max={2} step={0.05} onChange={setTwistBase} />
        <Knob label="turns (bands/waist)" value={twistTurns} min={-3} max={3} step={0.05} onChange={setTwistTurns} />
        <Knob label="wave" value={twistWave} min={0} max={1} step={0.02} onChange={setTwistWave} />
        <Knob label="wave freq" value={twistFreq} min={0} max={12} step={0.2} onChange={setTwistFreq} />
        <Knob label="wave speed" value={twistSpeed} min={0} max={3} step={0.05} onChange={setTwistSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Folds</strong>
        <Knob label="amp" value={foldAmp} min={0} max={1.5} step={0.02} onChange={setFoldAmp} />
        <Knob label="lateral" value={foldLateral} min={0} max={0.6} step={0.01} onChange={setFoldLateral} />
        <Knob label="freq" value={foldFreq} min={0} max={6} step={0.1} onChange={setFoldFreq} />
        <Knob label="speed" value={foldSpeed} min={0} max={3} step={0.05} onChange={setFoldSpeed} />
        <Knob label="octaves" value={shapeOctaves} min={1} max={6} step={1} onChange={setShapeOctaves} />
        <Knob label="roughness" value={shapeRoughness} min={0} max={1} step={0.05} onChange={setShapeRoughness} />
        <Knob label="flow scale" value={flowScale} min={0.1} max={4} step={0.05} onChange={setFlowScale} />
        <Knob label="pulse" value={pulse} min={0} max={0.6} step={0.02} onChange={setPulse} />
        <Knob label="pulse speed" value={pulseSpeed} min={0} max={4} step={0.05} onChange={setPulseSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Color</strong>
        <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
          <span style={{opacity: 0.7}}>mode</span>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as 'gradient' | 'palette')}
            style={{...configButtonStyle, flex: '0 0 150px', padding: '4px 8px'}}
          >
            <option value="gradient">gradient</option>
            <option value="palette">palette</option>
          </select>
        </label>
        <Knob label="along" value={colorAlong} min={0} max={4} step={0.05} onChange={setColorAlong} />
        <Knob label="across" value={colorAcross} min={0} max={2} step={0.02} onChange={setColorAcross} />
        <Knob label="active (palette)" value={colorActive} min={0} max={8} step={1} onChange={setColorActive} />
        <Knob
          label="change speed"
          value={colorChangeSpeed}
          min={0}
          max={6}
          step={0.05}
          onChange={setColorChangeSpeed}
        />
        <Knob label="wave" value={colorWave} min={0} max={2} step={0.02} onChange={setColorWave} />
        <Knob label="wave freq" value={colorFreq} min={0} max={6} step={0.1} onChange={setColorFreq} />
        <Knob label="wave speed" value={colorSpeed} min={0} max={3} step={0.05} onChange={setColorSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Fibers</strong>
        <Toggle label="fibers" value={fibers} onChange={setFibers} />
        <Knob label="count" value={fiberCount} min={4} max={400} step={4} onChange={setFiberCount} />
        <Knob label="contrast" value={fiberContrast} min={0} max={1} step={0.02} onChange={setFiberContrast} />
        <Knob label="shear" value={fiberShear} min={-2} max={2} step={0.05} onChange={setFiberShear} />
        <Knob label="drift" value={fiberDrift} min={0} max={1} step={0.01} onChange={setFiberDrift} />
        <Knob
          label="sharpness (thin)"
          value={fiberSharpness}
          min={0.5}
          max={16}
          step={0.5}
          onChange={setFiberSharpness}
        />
        <Knob label="jitter (spacing)" value={fiberJitter} min={0} max={1.5} step={0.05} onChange={setFiberJitter} />
        <Knob label="variation" value={fiberVariation} min={0} max={1} step={0.02} onChange={setFiberVariation} />
        <Knob label="gaps" value={fiberGaps} min={0} max={1} step={0.02} onChange={setFiberGaps} />
        <Knob label="glint (bright streaks)" value={fiberGlint} min={0} max={1} step={0.02} onChange={setFiberGlint} />
        <strong style={{fontSize: 13, marginTop: 8}}>Style</strong>
        <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
          <span style={{opacity: 0.7}}>draw</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as 'fill' | 'lines' | 'dots')}
            style={{...configButtonStyle, flex: '0 0 150px', padding: '4px 8px'}}
          >
            <option value="fill">fill</option>
            <option value="lines">lines</option>
            <option value="dots">dots</option>
          </select>
        </label>
        <Knob label="line count" value={lineCount} min={2} max={200} step={1} onChange={setLineCount} />
        <Knob label="line width" value={lineWidth} min={0.02} max={1} step={0.02} onChange={setLineWidth} />
        <Knob label="line shear" value={lineShear} min={-4} max={4} step={0.1} onChange={setLineShear} />
        <Knob label="dot count" value={dotCount} min={2} max={300} step={1} onChange={setDotCount} />
        <Knob label="dot width" value={dotWidth} min={0.02} max={1} step={0.02} onChange={setDotWidth} />
        <strong style={{fontSize: 13, marginTop: 8}}>Lighting</strong>
        <Toggle label="light" value={light} onChange={setLight} />
        <Knob label="ambient" value={ambientAmt} min={0} max={1} step={0.02} onChange={setAmbientAmt} />
        <Knob label="diffuse" value={diffuse} min={0} max={2} step={0.05} onChange={setDiffuse} />
        <Knob label="specular" value={specular} min={0} max={3} step={0.05} onChange={setSpecular} />
        <Knob label="shininess" value={shininess} min={1} max={120} step={1} onChange={setShininess} />
        <Knob label="rim" value={rim} min={0} max={1.5} step={0.02} onChange={setRim} />
        <Knob label="rim power" value={rimPower} min={0.5} max={8} step={0.1} onChange={setRimPower} />
        <Knob label="light dir x" value={lightDirX} min={-1} max={1} step={0.05} onChange={setLightDirX} />
        <Knob label="light dir y" value={lightDirY} min={-1} max={1} step={0.05} onChange={setLightDirY} />
        <Knob label="light dir z" value={lightDirZ} min={-1} max={1} step={0.05} onChange={setLightDirZ} />
        <Toggle label="light follows mouse" value={lightFollowsMouse} onChange={setLightFollowsMouse} />
        <strong style={{fontSize: 13, marginTop: 8}}>Effects</strong>
        <Toggle label="additive" value={additive} onChange={setAdditive} />
        <Knob label="glow" value={glow} min={0} max={3} step={0.05} onChange={setGlow} />
        <Knob label="fog" value={fog} min={0} max={1} step={0.02} onChange={setFog} />
        <Knob label="vignette" value={vignette} min={0} max={1} step={0.02} onChange={setVignette} />
        <Knob label="opacity" value={opacity} min={0} max={1} step={0.02} onChange={setOpacity} />
        <strong style={{fontSize: 13, marginTop: 8}}>Motion</strong>
        <Knob label="yaw speed" value={yawSpeed} min={-2} max={2} step={0.02} onChange={setYawSpeed} />
        <Knob label="pitch amp (bob)" value={pitchAmp} min={0} max={1} step={0.02} onChange={setPitchAmp} />
        <Knob label="pitch speed" value={pitchSpeed} min={0} max={3} step={0.05} onChange={setPitchSpeed} />
        <Knob label="center drift" value={centerDrift} min={0} max={1} step={0.02} onChange={setCenterDrift} />
        <Knob label="drift speed" value={centerDriftSpeed} min={0} max={3} step={0.05} onChange={setCenterDriftSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Pointer</strong>
        <Toggle label="reactToMouse (tilt)" value={reactToMouse} onChange={setReactToMouse} />
        <Knob label="tilt max" value={tiltMax} min={0} max={2} step={0.05} onChange={setTiltMax} />
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
        <Toggle label="bendMouse (local push)" value={bendMouse} onChange={setBendMouse} />
        <Knob label="bend radius (px)" value={bendRadius} min={20} max={600} step={5} onChange={setBendRadius} />
        <Knob label="bend strength (px)" value={bendStrength} min={0} max={250} step={5} onChange={setBendStrength} />
      </div>
      <SheetFieldWebGpu config={conf} style={{flex: 1, height: '100%', background: additive ? '#0a0a12' : undefined}} />
    </div>
  );
};

export const Playground: StoryObj<typeof meta> = {
  render: () => <PlaygroundDemo />,
};
