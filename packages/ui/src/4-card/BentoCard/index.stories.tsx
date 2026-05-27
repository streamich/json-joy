import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {useStyles} from '../../styles/context';
import {BentoCard, type BentoCardProps} from '.';
import type {Styles} from '../../styles/Styles';

const meta: Meta<typeof BentoCard> = {
  title: '4. Card/BentoCard',
  component: BentoCard,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};

export default meta;

const Content: React.FC<{title?: string; children?: React.ReactNode}> = ({title = 'Bento card', children}) => (
  <div
    style={{
      height: '100%',
      padding: 28,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}
  >
    <div style={{fontSize: 22, fontWeight: 700, marginBottom: 6}}>{title}</div>
    <div style={{fontSize: 14}}>{children ?? 'Hover me'}</div>
  </div>
);

const glow = (styles: Styles, color = 0): React.CSSProperties => {
  const mod = styles.brand.length;
  return {
    backgroundPosition: '0px 0px',
    backgroundImage: [
      // `radial-gradient(44% 6% at 330% 100%, ${styles.bg}, transparent)`,
      // `radial-gradient(33% 4% at 44% 100%, ${styles.bg}, transparent)`,
      // `radial-gradient(22% 2% at 55% 100%, ${styles.bg}, transparent)`,
      // `radial-gradient(55% 66% at 44% 90%, ${styles.brand[color % mod].fg.pct(0, 0.2, -0.1, -0.87)}, transparent 77%)`,
      // `radial-gradient(77% 55% at 34% 80%, ${styles.brand[(color + 1) % mod].fg.pct(0, 0.2, -0.1, -0.9)}, transparent 88%)`,
      `radial-gradient(77% 55% at 66% 70%, ${styles.brand[(color + 5) % mod].fg.pct(0, 0.2, -0.1, -0.66)}, transparent 99%)`,
      // `radial-gradient(77% 55% at 50% 88%, ${styles.brand[(color + 3) % mod].fg.pct(0, 0.2, -0.1, -0.87)}, transparent 55%)`,
      // `radial-gradient(77% 55% at 44% 77%, ${styles.brand[(color + 4) % mod].fg.pct(0, 0.2, -0.1, -0.9)}, transparent 77%)`,
      // `radial-gradient(77% 55% at 55% 99%, ${styles.brand[(color + 5) % mod].fg.pct(0, 0.2, -0.1, -0.77)}, transparent 88%)`,
      // `radial-gradient(77% 55% at 50% 66%, ${styles.brand[(color + 2) % mod].fg.pct(0, 0.5, 0.1, -0.67)}, transparent 55%)`,
    ].join(','),
  };
};

const Demo: React.FC<BentoCardProps> = (props) => {
  return (
    <BentoCard {...props} style={{width: 340, height: 444, background: '#fff', ...props.style}} header={<Content />} />
  );
};

export const Sheet: StoryObj<typeof BentoCard> = {
  render: (args) => <Demo {...args} />,
  args: {
    hoverExpand: true,
    background: 'sheet',
    borderRadius: 16,
    hoverBorderRadius: 8,
    backgroundConfig: {
      pointerArea: 'element',
      segments: 800,
      columns: 300,
      length: 4.4,
      width: 1.5,
      forward: [1.5, 0, 0.5],
      tilt: 0.45,
      taper: 0.12,
      twistBase: 0,
      twistTurns: 0.55,
      twistWave: 0.12,
      twistFreq: 2,
      twistSpeed: 0,
      foldAmp: 0.3,
      foldLateral: 0.08,
      foldFreq: 1.3,
      foldSpeed: 0.2,
      shapeOctaves: 3,
      shapeRoughness: 0.6,
      flowScale: 1,
      pulse: 0,
      pulseSpeed: 0.4,
      colorMode: 'gradient',
      color: {wave: 0.05, waveFreq: 0.8, waveSpeed: 0.2},
      colorAlong: 0.9,
      colorAcross: 0.12,
      colorActive: 4,
      colorChangeSpeed: 1,
      fibers: true,
      fiberCount: 220,
      fiberContrast: 0.35,
      fiberShear: 0.3,
      fiberDrift: 0.03,
      fiberSharpness: 4,
      fiberJitter: 0.45,
      fiberVariation: 0.55,
      fiberGaps: 0.3,
      fiberGlint: 0.5,
      light: true,
      ambient: 0.58,
      diffuse: 0.6,
      specular: 0.15,
      shininess: 11,
      rim: 0.98,
      rimPower: 3,
      lightDir: [0.2, 0.6, 0.7],
      lightFollowsMouse: true,
      fog: 0,
      glow: 0,
      vignette: 0.1,
      opacity: 1,
      additive: false,
      yawSpeed: 0,
      pitchAmp: 0,
      pitchSpeed: 0.1,
      perspective: 7,
      radius: 1,
      centerDrift: 0,
      centerDriftSpeed: 0.4,
      reactToMouse: true,
      tiltMax: 0.2,
      followMouse: true,
      followStrength: 0.05,
      followReach: 0.4,
      bendMouse: false,
      bendRadius: 160,
      bendStrength: 50,
    },
    border: true,
    borderProps: {
      colors: ['#07f', '#0cf', '#0ff', '#0cf'],
      radius: 300,
      delay: 222,
      thickness: 2,
    },
  },
};

export const Stick: StoryObj<typeof BentoCard> = {
  render: (args) => <Demo {...args} />,
  args: {
    hoverExpand: true,
    background: 'stick',
    borderRadius: 16,
    hoverBorderRadius: 6,
    backgroundConfig: {
      colors: ['#07f'],
      count: 444,
      radius: 1.3,
      origin: [0.5, 1],
      stickLength: 0.02,
      lineWidth: 4.8,
      rounding: 1,
      size: {base: 0.4, random: 0.35, wave: 1.4, waveFreq: 0.8, waveSpeed: 1.8, min: 0.15, max: 0.25},
      thickness: {base: 3.35, random: 0, wave: 1.3, waveFreq: 1.8, waveSpeed: 2.8, min: 3.55, max: 8},
      distance: {wave: 0, waveSpeed: 4.2},
      shapeOctaves: 1,
      shapeRoughness: 0,
      shapeSharpness: 1,
      pulse: 0,
      pulseSpeed: 0,
      flatten: 0,
      color: {wave: 1.45, random: 0, waveSpeed: 0.75},
      colorActive: 1,
      colorChangeSpeed: 2.45,
      magnetism: {base: 0.8, random: 0.05},
      fieldMode: 'radial',
      fieldDrift: 0,
      yawSpeed: 0.38,
      pitchAmp: 0.18,
      pitchSpeed: 0.35,
      perspective: 4.2,
      hideBack: true,
      cullDepth: 1,
      centerDrift: 0.08,
      centerDriftSpeed: 3,
      rays: true,
      rayWidth: 2.4,
      rayFrom: 0,
      rayTo: 0.5,
      rayAlphaNear: 1,
      rayAlphaFar: 0.14,
      fog: 0,
      twinkle: 1,
      twinkleSpeed: 4,
      vignette: 0,
      spin: 0,
      glow: 0,
      parallax: 0,
      additive: false,
      tiltMax: 0.65,
      reactToMouse: true,
      followMouse: false,
      followStrength: 0.6,
      followReach: 1.2,
      repelMouse: true,
      repelRadius: 265,
      repelStrength: 105,
    },
    border: true,
    borderProps: {
      colors: ['#07f', '#48a', '#6cc'],
      radius: 333,
      delay: 222,
      thickness: 2,
    },
    tilt: {
      scale: 1,
      max: 5,
    },
  },
};

export const BorderOnly: StoryObj<typeof BentoCard> = {
  render: (args) => (
    <Demo {...args}>
      <Content title="Border only" />
    </Demo>
  ),
  args: {border: true},
};

const TRIO: {title: string; body: string}[] = [
  {
    title: 'Plain text',
    body: 'The fastest RGA-based text CRDT for collaborative text synchronization, with drop-in bindings for every editor.',
  },
  {
    title: 'JSON',
    body: 'Model app state as nested objects, arrays, and maps. The whole document is one mergeable JSON CRDT.',
  },
  {
    title: 'Rich-text',
    body: 'Block-level structure that stays correct through concurrent splits, merges, and formatting.',
  },
];

const TrioContent: React.FC<{title: string; body: string}> = ({title, body}) => (
  <div style={{padding: 28, boxSizing: 'border-box'}}>
    <div style={{fontSize: 22, fontWeight: 700, marginBottom: 10}}>{title}</div>
    <div style={{fontSize: 15, lineHeight: '1.6em', opacity: 0.65}}>{body}</div>
  </div>
);

const Trio: React.FC = () => {
  const styles = useStyles();
  return (
    <div style={{display: 'flex', alignItems: 'stretch', gap: 20, width: 1080, maxWidth: '100%', height: 450}}>
      {TRIO.map((f, i) => (
        <BentoCard
          key={i}
          hoverExpand
          border
          borderRadius={16}
          hoverBorderRadius={8}
          borderProps={{thickness: 2, delay: 150}}
          backgroundStyle={glow(styles, i * 2)}
          style={{flex: '1 1 0', minWidth: 0, background: '#fff'}}
          header={<TrioContent title={f.title} body={f.body} />}
        />
      ))}
    </div>
  );
};

export const ThreeUp: StoryObj<typeof BentoCard> = {
  parameters: {layout: 'centered'},
  render: () => <Trio />,
};
