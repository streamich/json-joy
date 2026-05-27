import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {InputNumber} from '../../2-inline-block/InputNumber';
import {LiquidLayersWebGpu} from '.';
import {
  ambient,
  behindCard,
  cardFooter,
  cells,
  contours,
  DEFAULT_CONFIG,
  glass,
  lavaLamp,
  monochrome,
  pinkStack,
  PRESETS,
  resolvePreset,
  scrollReactive,
} from './presets';
import type {LiquidLayersOptions} from './types';

const meta: Meta<typeof LiquidLayersWebGpu> = {
  title: '5. Block/LiquidLayers (WebGPU)',
  component: LiquidLayersWebGpu,
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
  color: '#fff',
  mixBlendMode: 'overlay',
};

const presetStory = (config: LiquidLayersOptions, opts: {label?: string} = {}): StoryObj<typeof meta> => ({
  render: () => (
    <LiquidLayersWebGpu config={resolvePreset(config)} style={frameStyle}>
      {opts.label ? <h1 style={headingStyle}>{opts.label}</h1> : null}
    </LiquidLayersWebGpu>
  ),
});

export const Default: StoryObj<typeof meta> = presetStory({}, {label: 'json-joy'});
export const PinkStack: StoryObj<typeof meta> = presetStory(pinkStack, {label: 'Build with json-joy'});
export const LavaLamp: StoryObj<typeof meta> = presetStory(lavaLamp);
export const Contours: StoryObj<typeof meta> = presetStory(contours);
export const Cells: StoryObj<typeof meta> = presetStory(cells);
export const Monochrome: StoryObj<typeof meta> = presetStory(monochrome, {label: 'Your content'});
export const Glass: StoryObj<typeof meta> = presetStory(glass, {label: 'Your content'});
export const Ambient: StoryObj<typeof meta> = presetStory(ambient);
export const CardFooter: StoryObj<typeof meta> = presetStory(cardFooter);
export const BehindCard: StoryObj<typeof meta> = presetStory(behindCard, {label: 'Your content'});

export const ScrollReactive: StoryObj<typeof meta> = {
  render: () => (
    <div style={{height: '300vh', position: 'relative'}}>
      <div style={{position: 'sticky', top: 0, height: '100vh'}}>
        <LiquidLayersWebGpu
          config={resolvePreset(scrollReactive)}
          style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <h1 style={headingStyle}>Scroll the page</h1>
        </LiquidLayersWebGpu>
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
const serializeConfig = (conf: LiquidLayersOptions): string =>
  `{\n${Object.entries(conf)
    .map(([k, v]) => `  ${k}: ${fmtVal(v)},`)
    .join('\n')}\n}`;

const D = DEFAULT_CONFIG;

const PlaygroundDemo: React.FC = () => {
  const [count, setCount] = React.useState(D.count ?? 7);
  const [level, setLevel] = React.useState(D.level ?? 0.82);
  const [levelStep, setLevelStep] = React.useState(D.levelStep ?? 0.05);
  const [mode, setMode] = React.useState<'independent' | 'contours'>(D.mode ?? 'independent');
  const [sources, setSources] = React.useState(D.sources ?? 3);
  const [sourceRadius, setSourceRadius] = React.useState(D.sourceRadius ?? 0.34);
  const [sourceRadiusVar, setSourceRadiusVar] = React.useState(D.sourceRadiusVar ?? 0.25);
  const [spread, setSpread] = React.useState(D.spread ?? 0.34);
  const [attraction, setAttraction] = React.useState(D.attraction ?? 0.15);
  const [warp, setWarp] = React.useState(D.warp ?? 0.18);
  const [warpScale, setWarpScale] = React.useState(D.warpScale ?? 1.6);
  const [octaves, setOctaves] = React.useState(D.octaves ?? 2);
  const [roughness, setRoughness] = React.useState(D.roughness ?? 0.6);
  const [opacity, setOpacity] = React.useState(D.opacity ?? 1);
  const [elevation, setElevation] = React.useState(D.elevation ?? 1);
  const [originX, setOriginX] = React.useState((D.origin ?? [0.5, 0.5])[0]);
  const [originY, setOriginY] = React.useState((D.origin ?? [0.5, 0.5])[1]);
  const [colorMode, setColorMode] = React.useState<'depth' | 'perLayer'>(D.colorMode ?? 'depth');
  const [colorActive, setColorActive] = React.useState(D.colorActive ?? 0);
  const [colorChangeSpeed, setColorChangeSpeed] = React.useState(D.colorChangeSpeed ?? 0.4);
  // Comma-separated CSS colors; empty falls back to the theme `brand` palette.
  const [colorsText, setColorsText] = React.useState((D.colors ?? []).join(', '));
  const [lightAngle, setLightAngle] = React.useState(D.lightAngle ?? 2.3);
  const [shadow, setShadow] = React.useState(D.shadow ?? 0.55);
  const [shadowOffset, setShadowOffset] = React.useState(D.shadowOffset ?? 0.05);
  const [shadowSoftness, setShadowSoftness] = React.useState(D.shadowSoftness ?? 0.5);
  const [shadowSteps, setShadowSteps] = React.useState(D.shadowSteps ?? 6);
  const [sheen, setSheen] = React.useState(D.sheen ?? 0.12);
  const [rimPower, setRimPower] = React.useState(D.rimPower ?? 2.5);
  const [morphSpeed, setMorphSpeed] = React.useState(D.morphSpeed ?? 0.3);
  const [warpSpeed, setWarpSpeed] = React.useState(D.warpSpeed ?? 0.12);
  const [speed, setSpeed] = React.useState(D.speed ?? 1);
  const [additive, setAdditive] = React.useState(D.additive ?? false);
  const [reactToMouse, setReactToMouse] = React.useState<NonNullable<LiquidLayersOptions['reactToMouse']>>(
    D.reactToMouse ?? 'attract',
  );
  const [mouseStrength, setMouseStrength] = React.useState(D.mouseStrength ?? 60);
  const [mouseRadius, setMouseRadius] = React.useState(D.mouseRadius ?? 200);
  const [resolutionScale, setResolutionScale] = React.useState(D.resolutionScale ?? 0.75);
  const [showConfig, setShowConfig] = React.useState(false);
  const [presetIdx, setPresetIdx] = React.useState(0);

  // Load a preset into all the knobs. Non-knob fields (colors, ripple, scroll)
  // are not represented here.
  const applyPreset = (i: number): void => {
    setPresetIdx(i);
    const c = resolvePreset(PRESETS[i].config);
    setCount(c.count ?? 7);
    setLevel(c.level ?? 0.82);
    setLevelStep(c.levelStep ?? 0.05);
    setMode(c.mode ?? 'independent');
    setSources(c.sources ?? 3);
    setSourceRadius(c.sourceRadius ?? 0.34);
    setSourceRadiusVar(c.sourceRadiusVar ?? 0.25);
    setSpread(c.spread ?? 0.34);
    setAttraction(c.attraction ?? 0.15);
    setWarp(c.warp ?? 0.18);
    setWarpScale(c.warpScale ?? 1.6);
    setOctaves(c.octaves ?? 2);
    setRoughness(c.roughness ?? 0.6);
    setOpacity(c.opacity ?? 1);
    setElevation(c.elevation ?? 1);
    setOriginX((c.origin ?? [0.5, 0.5])[0]);
    setOriginY((c.origin ?? [0.5, 0.5])[1]);
    setColorMode(c.colorMode ?? 'depth');
    setColorActive(c.colorActive ?? 0);
    setColorChangeSpeed(c.colorChangeSpeed ?? 0.4);
    setColorsText((c.colors ?? []).join(', '));
    setLightAngle(c.lightAngle ?? 2.3);
    setShadow(c.shadow ?? 0.55);
    setShadowOffset(c.shadowOffset ?? 0.05);
    setShadowSoftness(c.shadowSoftness ?? 0.5);
    setShadowSteps(c.shadowSteps ?? 6);
    setSheen(c.sheen ?? 0.12);
    setRimPower(c.rimPower ?? 2.5);
    setMorphSpeed(c.morphSpeed ?? 0.3);
    setWarpSpeed(c.warpSpeed ?? 0.12);
    setSpeed(c.speed ?? 1);
    setAdditive(c.additive ?? false);
    setReactToMouse(c.reactToMouse ?? 'attract');
    setMouseStrength(c.mouseStrength ?? 60);
    setMouseRadius(c.mouseRadius ?? 200);
    setResolutionScale(c.resolutionScale ?? 0.75);
  };

  const conf: LiquidLayersOptions = {
    count,
    level,
    levelStep,
    mode,
    sources,
    sourceRadius,
    sourceRadiusVar,
    spread,
    attraction,
    warp,
    warpScale,
    octaves,
    roughness,
    opacity,
    elevation,
    origin: [originX, originY],
    colorMode,
    colorActive,
    colorChangeSpeed,
    lightAngle,
    shadow,
    shadowOffset,
    shadowSoftness,
    shadowSteps,
    sheen,
    rimPower,
    morphSpeed,
    warpSpeed,
    speed,
    additive,
    reactToMouse,
    mouseStrength,
    mouseRadius,
    resolutionScale,
  };
  const colorsArr = colorsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (colorsArr.length) conf.colors = colorsArr;
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
        <strong style={{fontSize: 13}}>Stack</strong>
        <Knob label="count" value={count} min={1} max={16} step={1} onChange={setCount} />
        <Knob label="level (threshold)" value={level} min={0.1} max={2} step={0.01} onChange={setLevel} />
        <Knob label="level step" value={levelStep} min={-0.3} max={0.3} step={0.01} onChange={setLevelStep} />
        <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
          <span style={{opacity: 0.7}}>mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'independent' | 'contours')}
            style={{...configButtonStyle, flex: '0 0 150px', padding: '4px 8px'}}
          >
            <option value="independent">independent</option>
            <option value="contours">contours</option>
          </select>
        </label>
        <Knob label="origin x" value={originX} min={-0.5} max={1.5} step={0.02} onChange={setOriginX} />
        <Knob label="origin y" value={originY} min={-0.5} max={1.5} step={0.02} onChange={setOriginY} />
        <strong style={{fontSize: 13, marginTop: 8}}>Sources (split/merge)</strong>
        <Knob label="sources / layer" value={sources} min={1} max={10} step={1} onChange={setSources} />
        <Knob label="source radius" value={sourceRadius} min={0.05} max={0.8} step={0.01} onChange={setSourceRadius} />
        <Knob label="radius var" value={sourceRadiusVar} min={0} max={1} step={0.02} onChange={setSourceRadiusVar} />
        <Knob label="spread" value={spread} min={0} max={0.8} step={0.01} onChange={setSpread} />
        <Knob label="attraction" value={attraction} min={-1} max={1} step={0.02} onChange={setAttraction} />
        <Knob label="morph speed" value={morphSpeed} min={0} max={1.5} step={0.02} onChange={setMorphSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Edge warp</strong>
        <Knob label="warp" value={warp} min={0} max={0.8} step={0.01} onChange={setWarp} />
        <Knob label="warp scale" value={warpScale} min={0.2} max={6} step={0.1} onChange={setWarpScale} />
        <Knob label="octaves" value={octaves} min={1} max={5} step={1} onChange={setOctaves} />
        <Knob label="roughness" value={roughness} min={0} max={1} step={0.05} onChange={setRoughness} />
        <Knob label="warp speed" value={warpSpeed} min={0} max={1} step={0.01} onChange={setWarpSpeed} />
        <strong style={{fontSize: 13, marginTop: 8}}>Color</strong>
        <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
          <span style={{opacity: 0.7}}>mode</span>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as 'depth' | 'perLayer')}
            style={{...configButtonStyle, flex: '0 0 150px', padding: '4px 8px'}}
          >
            <option value="depth">depth</option>
            <option value="perLayer">perLayer</option>
          </select>
        </label>
        <Knob label="active (rotate)" value={colorActive} min={0} max={8} step={1} onChange={setColorActive} />
        <Knob
          label="change speed"
          value={colorChangeSpeed}
          min={0}
          max={4}
          step={0.05}
          onChange={setColorChangeSpeed}
        />
        <Knob label="opacity" value={opacity} min={0} max={1} step={0.02} onChange={setOpacity} />
        <label style={{display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12}}>
          <span style={{opacity: 0.7}}>colors (comma-separated CSS; empty = theme brand)</span>
          <input
            value={colorsText}
            onChange={(e) => setColorsText(e.target.value)}
            placeholder="#4f5bd5, #6571de, #7b87e8"
            style={{...configButtonStyle, flex: 'none', padding: '6px 8px', fontFamily: 'monospace'}}
          />
        </label>
        <strong style={{fontSize: 13, marginTop: 8}}>Light + shadow</strong>
        <Knob label="light angle" value={lightAngle} min={-3.14} max={3.14} step={0.05} onChange={setLightAngle} />
        <Knob label="shadow" value={shadow} min={0} max={1} step={0.02} onChange={setShadow} />
        <Knob label="shadow offset" value={shadowOffset} min={0} max={0.2} step={0.005} onChange={setShadowOffset} />
        <Knob label="shadow softness" value={shadowSoftness} min={0} max={1} step={0.02} onChange={setShadowSoftness} />
        <Knob label="shadow steps" value={shadowSteps} min={1} max={32} step={1} onChange={setShadowSteps} />
        <Knob label="elevation" value={elevation} min={0} max={3} step={0.05} onChange={setElevation} />
        <Knob label="sheen" value={sheen} min={0} max={1} step={0.02} onChange={setSheen} />
        <Knob label="rim power" value={rimPower} min={0.5} max={8} step={0.1} onChange={setRimPower} />
        <strong style={{fontSize: 13, marginTop: 8}}>Motion</strong>
        <Knob label="speed" value={speed} min={0} max={3} step={0.05} onChange={setSpeed} />
        <Toggle label="additive" value={additive} onChange={setAdditive} />
        <strong style={{fontSize: 13, marginTop: 8}}>Pointer</strong>
        <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12}}>
          <span style={{opacity: 0.7}}>react</span>
          <select
            value={reactToMouse}
            onChange={(e) => setReactToMouse(e.target.value as NonNullable<LiquidLayersOptions['reactToMouse']>)}
            style={{...configButtonStyle, flex: '0 0 150px', padding: '4px 8px'}}
          >
            <option value="none">none</option>
            <option value="part">part</option>
            <option value="attract">attract</option>
            <option value="ripple">ripple</option>
          </select>
        </label>
        <Knob label="mouse strength" value={mouseStrength} min={0} max={200} step={5} onChange={setMouseStrength} />
        <Knob label="mouse radius" value={mouseRadius} min={20} max={600} step={10} onChange={setMouseRadius} />
        <strong style={{fontSize: 13, marginTop: 8}}>Performance</strong>
        <Knob
          label="resolution scale"
          value={resolutionScale}
          min={0.4}
          max={1}
          step={0.05}
          onChange={setResolutionScale}
        />
      </div>
      <LiquidLayersWebGpu config={conf} style={{flex: 1, height: '100%'}} />
    </div>
  );
};

export const Playground: StoryObj<typeof meta> = {
  render: () => <PlaygroundDemo />,
};
