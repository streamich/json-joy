import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {CopyButton} from '../../2-inline-block/CopyButton';
import {InputNumber} from '../../2-inline-block/InputNumber';
import {StickFieldWebGpu} from '.';
import {
  ambient,
  behindCard,
  cardFooter,
  landingHero,
  magneticLines,
  nebula,
  PRESETS,
  raysStarburst,
  resolvePreset,
  roundedSquares,
  scrollReactive,
  sheet,
  squares,
  swirl,
} from './presets';
import type {StickFieldOptions} from './types';

const meta: Meta<typeof StickFieldWebGpu> = {
  title: '5. Block/StickField (WebGPU)',
  component: StickFieldWebGpu,
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
  config: StickFieldOptions,
  opts: {dark?: boolean; label?: string} = {},
): StoryObj<typeof meta> => ({
  render: () => (
    <StickFieldWebGpu
      config={resolvePreset(config)}
      style={opts.dark ? {...frameStyle, background: '#0a0a12'} : frameStyle}
    >
      {opts.label ? <h1 style={opts.dark ? headingDark : headingStyle}>{opts.label}</h1> : null}
    </StickFieldWebGpu>
  ),
});

export const Default: StoryObj<typeof meta> = presetStory({}, {label: 'json-joy'});
export const CardFooter: StoryObj<typeof meta> = presetStory(cardFooter);
export const BehindCard: StoryObj<typeof meta> = presetStory(behindCard, {label: 'Your content'});
export const LandingHero: StoryObj<typeof meta> = presetStory(landingHero, {label: 'Build with json-joy'});
export const Ambient: StoryObj<typeof meta> = presetStory(ambient);
export const Squares: StoryObj<typeof meta> = presetStory(squares);
export const RoundedSquares: StoryObj<typeof meta> = presetStory(roundedSquares);
export const RaysStarburst: StoryObj<typeof meta> = presetStory(raysStarburst);
export const Nebula: StoryObj<typeof meta> = presetStory(nebula, {dark: true});
export const Sheet: StoryObj<typeof meta> = presetStory(sheet);
export const Swirl: StoryObj<typeof meta> = presetStory(swirl);
export const MagneticLines: StoryObj<typeof meta> = presetStory(magneticLines);

export const Massive: StoryObj<typeof meta> = {
  render: () => (
    <StickFieldWebGpu config={resolvePreset({count: 80000, radius: 1})} style={{...frameStyle, overflow: 'hidden'}}>
      <h1 style={headingStyle}>80k sticks</h1>
    </StickFieldWebGpu>
  ),
};

// Scroll effects are driven by page scroll, so they need a scrollable page (the
// Playground is fixed-height and can't scroll). This wraps a sticky full-height
// canvas in a tall area; scrolling rotates and breathes the cloud.
export const ScrollReactive: StoryObj<typeof meta> = {
  render: () => (
    <div style={{height: '300vh', position: 'relative'}}>
      <div style={{position: 'sticky', top: 0, height: '100vh'}}>
        <StickFieldWebGpu
          config={resolvePreset(scrollReactive)}
          style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <h1 style={headingStyle}>Scroll the page</h1>
        </StickFieldWebGpu>
      </div>
    </div>
  ),
};

// Local element scroll: the cloud reacts to a scroll container it lives in (not
// the page). Vertical scroll spins it; the canvas stays pinned via a sticky wrap.
export const LocalScroll: StoryObj<typeof meta> = {
  render: () => (
    <div style={{height: 480, overflow: 'auto'}}>
      <div style={{position: 'sticky', top: 0, height: 480}}>
        <StickFieldWebGpu
          config={resolvePreset({
            yawSpeed: 0.04,
            reactToMouse: false,
            followMouse: false,
            scrollBindings: [
              {source: 'element', axis: 'y', target: 'yaw', scale: 6},
              {source: 'element', axis: 'y', target: 'glow', scale: 1.2},
            ],
          })}
          style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <h1 style={headingStyle}>Scroll this panel</h1>
        </StickFieldWebGpu>
      </div>
      <div style={{height: 1200}} />
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

const PlaygroundDemo: React.FC = () => {
  const [count, setCount] = React.useState(2000);
  const [radius, setRadius] = React.useState(0.78);
  const [originX, setOriginX] = React.useState(0.5);
  const [originY, setOriginY] = React.useState(0.5);
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
  const [pitchAmp, setPitchAmp] = React.useState(0.18);
  const [pitchSpeed, setPitchSpeed] = React.useState(0.35);
  const [perspective, setPerspective] = React.useState(4.2);
  const [tiltMax, setTiltMax] = React.useState(0.65);
  const [hideBack, setHideBack] = React.useState(false);
  const [cullDepth, setCullDepth] = React.useState(0.35);
  const [reactToMouse, setReactToMouse] = React.useState(true);
  const [followMouse, setFollowMouse] = React.useState(true);
  const [followStrength, setFollowStrength] = React.useState(0.6);
  const [followReach, setFollowReach] = React.useState(1.2);
  const [rounding, setRounding] = React.useState(1);
  const [centerDrift, setCenterDrift] = React.useState(0);
  const [centerDriftSpeed, setCenterDriftSpeed] = React.useState(0.6);
  const [repelMouse, setRepelMouse] = React.useState(false);
  const [repelRadius, setRepelRadius] = React.useState(140);
  const [repelStrength, setRepelStrength] = React.useState(60);
  const [fieldMode, setFieldMode] = React.useState(0);
  const [fieldDrift, setFieldDrift] = React.useState(0);
  const [rays, setRays] = React.useState(false);
  const [rayWidth, setRayWidth] = React.useState(1);
  const [rayFrom, setRayFrom] = React.useState(0);
  const [rayTo, setRayTo] = React.useState(1);
  const [rayAlphaNear, setRayAlphaNear] = React.useState(0.4);
  const [rayAlphaFar, setRayAlphaFar] = React.useState(0);
  const [fog, setFog] = React.useState(0);
  const [twinkle, setTwinkle] = React.useState(0);
  const [twinkleSpeed, setTwinkleSpeed] = React.useState(4);
  const [vignette, setVignette] = React.useState(0);
  const [spin, setSpin] = React.useState(0);
  const [glow, setGlow] = React.useState(0);
  const [parallax, setParallax] = React.useState(0);
  const [additive, setAdditive] = React.useState(false);
  const [showConfig, setShowConfig] = React.useState(false);
  const [presetIdx, setPresetIdx] = React.useState(0);
  const fieldModeName = (['radial', 'line', 'ring'] as const)[fieldMode] ?? 'radial';

  // Load a preset into all the knobs. Non-knob fields (fieldAxis, ray/fog colors)
  // are not represented here; the dedicated stories show those at full fidelity.
  const applyPreset = (i: number): void => {
    setPresetIdx(i);
    const c = resolvePreset(PRESETS[i].config);
    const sz = c.size ?? {};
    const th = c.thickness ?? {};
    const ds = c.distance ?? {};
    const cl = c.color ?? {};
    const mg = c.magnetism ?? {};
    setCount(c.count ?? 0);
    setRadius(c.radius ?? 0);
    setOriginX(c.origin?.[0] ?? 0.5);
    setOriginY(c.origin?.[1] ?? 0.5);
    setStickLength(c.stickLength ?? 0);
    setLineWidth(c.lineWidth ?? 0);
    setRounding(c.rounding ?? 0);
    setSizeBase(sz.base ?? 0);
    setSizeRandom(sz.random ?? 0);
    setSizeWave(sz.wave ?? 0);
    setSizeFreq(sz.waveFreq ?? 0);
    setSizeSpeed(sz.waveSpeed ?? 0);
    setSizeMin(sz.min ?? 0);
    setSizeMax(sz.max ?? 0);
    setThickBase(th.base ?? 0);
    setThickRandom(th.random ?? 0);
    setThickWave(th.wave ?? 0);
    setThickFreq(th.waveFreq ?? 0);
    setThickSpeed(th.waveSpeed ?? 0);
    setThickMin(th.min ?? 0);
    setThickMax(th.max ?? 0);
    setDistWave(ds.wave ?? 0);
    setDistSpeed(ds.waveSpeed ?? 0);
    setShapeOctaves(c.shapeOctaves ?? 1);
    setShapeRoughness(c.shapeRoughness ?? 0);
    setShapeSharpness(c.shapeSharpness ?? 1);
    setPulse(c.pulse ?? 0);
    setPulseSpeed(c.pulseSpeed ?? 0);
    setFlatten(c.flatten ?? 0);
    setColorWave(cl.wave ?? 0);
    setColorRandom(cl.random ?? 0);
    setColorSpeed(cl.waveSpeed ?? 0);
    setColorActive(c.colorActive ?? 0);
    setColorChangeSpeed(c.colorChangeSpeed ?? 0);
    setMagBase(mg.base ?? 0);
    setMagRandom(mg.random ?? 0);
    setFieldMode({radial: 0, line: 1, ring: 2}[c.fieldMode ?? 'radial']);
    setFieldDrift(c.fieldDrift ?? 0);
    setYawSpeed(c.yawSpeed ?? 0);
    setPitchAmp(c.pitchAmp ?? 0);
    setPitchSpeed(c.pitchSpeed ?? 0);
    setPerspective(c.perspective ?? 1);
    setHideBack(c.hideBack ?? false);
    setCullDepth(c.cullDepth ?? 0);
    setCenterDrift(c.centerDrift ?? 0);
    setCenterDriftSpeed(c.centerDriftSpeed ?? 0);
    setRays(c.rays ?? false);
    setRayWidth(c.rayWidth ?? 1);
    setRayFrom(c.rayFrom ?? 0);
    setRayTo(c.rayTo ?? 1);
    setRayAlphaNear(c.rayAlphaNear ?? 0);
    setRayAlphaFar(c.rayAlphaFar ?? 0);
    setFog(c.fog ?? 0);
    setTwinkle(c.twinkle ?? 0);
    setTwinkleSpeed(c.twinkleSpeed ?? 0);
    setVignette(c.vignette ?? 0);
    setSpin(c.spin ?? 0);
    setGlow(c.glow ?? 0);
    setParallax(c.parallax ?? 0);
    setAdditive(c.additive ?? false);
    setTiltMax(c.tiltMax ?? 0);
    setReactToMouse(c.reactToMouse ?? false);
    setFollowMouse(c.followMouse ?? false);
    setFollowStrength(c.followStrength ?? 0);
    setFollowReach(c.followReach ?? 0);
    setRepelMouse(c.repelMouse ?? false);
    setRepelRadius(c.repelRadius ?? 0);
    setRepelStrength(c.repelStrength ?? 0);
  };

  const config =
    `<StickFieldWebGpu\n` +
    `  config={{\n` +
    `    count: ${count},\n` +
    `    radius: ${radius},\n` +
    `    origin: [${originX}, ${originY}],\n` +
    `    stickLength: ${stickLength},\n` +
    `    lineWidth: ${lineWidth},\n` +
    `    rounding: ${rounding},\n` +
    `    size: {base: ${sizeBase}, random: ${sizeRandom}, wave: ${sizeWave}, waveFreq: ${sizeFreq}, waveSpeed: ${sizeSpeed}, min: ${sizeMin}, max: ${sizeMax}},\n` +
    `    thickness: {base: ${thickBase}, random: ${thickRandom}, wave: ${thickWave}, waveFreq: ${thickFreq}, waveSpeed: ${thickSpeed}, min: ${thickMin}, max: ${thickMax}},\n` +
    `    distance: {wave: ${distWave}, waveSpeed: ${distSpeed}},\n` +
    `    shapeOctaves: ${shapeOctaves},\n` +
    `    shapeRoughness: ${shapeRoughness},\n` +
    `    shapeSharpness: ${shapeSharpness},\n` +
    `    pulse: ${pulse},\n` +
    `    pulseSpeed: ${pulseSpeed},\n` +
    `    flatten: ${flatten},\n` +
    `    color: {wave: ${colorWave}, random: ${colorRandom}, waveSpeed: ${colorSpeed}},\n` +
    `    colorActive: ${colorActive},\n` +
    `    colorChangeSpeed: ${colorChangeSpeed},\n` +
    `    magnetism: {base: ${magBase}, random: ${magRandom}},\n` +
    `    fieldMode: '${fieldModeName}',\n` +
    `    fieldDrift: ${fieldDrift},\n` +
    `    yawSpeed: ${yawSpeed},\n` +
    `    pitchAmp: ${pitchAmp},\n` +
    `    pitchSpeed: ${pitchSpeed},\n` +
    `    perspective: ${perspective},\n` +
    `    hideBack: ${hideBack},\n` +
    `    cullDepth: ${cullDepth},\n` +
    `    centerDrift: ${centerDrift},\n` +
    `    centerDriftSpeed: ${centerDriftSpeed},\n` +
    `    rays: ${rays},\n` +
    `    rayWidth: ${rayWidth},\n` +
    `    rayFrom: ${rayFrom},\n` +
    `    rayTo: ${rayTo},\n` +
    `    rayAlphaNear: ${rayAlphaNear},\n` +
    `    rayAlphaFar: ${rayAlphaFar},\n` +
    `    fog: ${fog},\n` +
    `    twinkle: ${twinkle},\n` +
    `    twinkleSpeed: ${twinkleSpeed},\n` +
    `    vignette: ${vignette},\n` +
    `    spin: ${spin},\n` +
    `    glow: ${glow},\n` +
    `    parallax: ${parallax},\n` +
    `    additive: ${additive},\n` +
    `    tiltMax: ${tiltMax},\n` +
    `    reactToMouse: ${reactToMouse},\n` +
    `    followMouse: ${followMouse},\n` +
    `    followStrength: ${followStrength},\n` +
    `    followReach: ${followReach},\n` +
    `    repelMouse: ${repelMouse},\n` +
    `    repelRadius: ${repelRadius},\n` +
    `    repelStrength: ${repelStrength},\n` +
    `  }}\n` +
    `/>`;

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
        <strong style={{fontSize: 13}}>Sphere</strong>
        <Knob label="count" value={count} min={10} max={200000} step={1000} onChange={setCount} />
        <Knob label="radius (blob size)" value={radius} min={0.1} max={12} step={0.05} onChange={setRadius} />
        <Knob label="origin x (0..1)" value={originX} min={-0.5} max={1.5} step={0.02} onChange={setOriginX} />
        <Knob label="origin y (0..1)" value={originY} min={-0.5} max={1.5} step={0.02} onChange={setOriginY} />
        <Knob label="perspective" value={perspective} min={1.2} max={20} step={0.1} onChange={setPerspective} />
        <Knob label="yaw speed" value={yawSpeed} min={-2} max={2} step={0.02} onChange={setYawSpeed} />
        <Knob label="pitch amp (bob)" value={pitchAmp} min={0} max={1.5} step={0.02} onChange={setPitchAmp} />
        <Knob label="pitch speed" value={pitchSpeed} min={0} max={3} step={0.05} onChange={setPitchSpeed} />
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
        <Knob
          label="rounding (1=capsule, 0=rect)"
          value={rounding}
          min={0}
          max={1}
          step={0.05}
          onChange={setRounding}
        />
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
        <Knob
          label="field (0 radial,1 line,2 ring)"
          value={fieldMode}
          min={0}
          max={2}
          step={1}
          onChange={setFieldMode}
        />
        <Knob label="field drift" value={fieldDrift} min={0} max={1} step={0.02} onChange={setFieldDrift} />
        <strong style={{fontSize: 13, marginTop: 8}}>Rays</strong>
        <Toggle label="rays" value={rays} onChange={setRays} />
        <Knob label="width (px)" value={rayWidth} min={0.2} max={6} step={0.1} onChange={setRayWidth} />
        <Knob
          label="from (0 stick, <0 past stick)"
          value={rayFrom}
          min={-1}
          max={1}
          step={0.02}
          onChange={setRayFrom}
        />
        <Knob label="to (1 center, >1 past center)" value={rayTo} min={-1} max={2} step={0.02} onChange={setRayTo} />
        <Knob label="alpha near" value={rayAlphaNear} min={0} max={1} step={0.02} onChange={setRayAlphaNear} />
        <Knob label="alpha far" value={rayAlphaFar} min={0} max={1} step={0.02} onChange={setRayAlphaFar} />
        <strong style={{fontSize: 13, marginTop: 8}}>Effects</strong>
        <Toggle label="additive (nebula)" value={additive} onChange={setAdditive} />
        <Knob label="glow (core)" value={glow} min={0} max={3} step={0.05} onChange={setGlow} />
        <Knob label="fog (depth)" value={fog} min={0} max={1} step={0.02} onChange={setFog} />
        <Knob label="twinkle" value={twinkle} min={0} max={1} step={0.02} onChange={setTwinkle} />
        <Knob label="twinkle speed" value={twinkleSpeed} min={0} max={12} step={0.1} onChange={setTwinkleSpeed} />
        <Knob label="vignette" value={vignette} min={0} max={1} step={0.02} onChange={setVignette} />
        <Knob label="spin" value={spin} min={0} max={4} step={0.05} onChange={setSpin} />
        <Knob label="parallax" value={parallax} min={0} max={1.5} step={0.02} onChange={setParallax} />
        <strong style={{fontSize: 13, marginTop: 8}}>Center of attraction</strong>
        <Knob label="drift" value={centerDrift} min={0} max={1} step={0.02} onChange={setCenterDrift} />
        <Knob label="drift speed" value={centerDriftSpeed} min={0} max={3} step={0.05} onChange={setCenterDriftSpeed} />
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
        <Toggle label="repelMouse (local push)" value={repelMouse} onChange={setRepelMouse} />
        <Knob label="repel radius (px)" value={repelRadius} min={20} max={1000} step={5} onChange={setRepelRadius} />
        <Knob
          label="repel strength (px)"
          value={repelStrength}
          min={0}
          max={250}
          step={5}
          onChange={setRepelStrength}
        />
      </div>
      <StickFieldWebGpu
        config={{
          count,
          radius,
          origin: [originX, originY],
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
          fieldMode: fieldModeName,
          fieldDrift,
          yawSpeed,
          pitchAmp,
          pitchSpeed,
          perspective,
          hideBack,
          cullDepth,
          centerDrift,
          centerDriftSpeed,
          rays,
          rayWidth,
          rayFrom,
          rayTo,
          rayAlphaNear,
          rayAlphaFar,
          fog,
          twinkle,
          twinkleSpeed,
          vignette,
          spin,
          glow,
          parallax,
          additive,
          tiltMax,
          reactToMouse,
          followMouse,
          followStrength,
          followReach,
          repelMouse,
          repelRadius,
          repelStrength,
        }}
        style={{flex: 1, height: '100%'}}
      />
    </div>
  );
};

export const Playground: StoryObj<typeof meta> = {
  render: () => <PlaygroundDemo />,
};
