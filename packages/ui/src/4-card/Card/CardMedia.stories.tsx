import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {useStyles} from '../../styles/context';
import {Eyebrow} from '../../1-inline/Eyebrow';
import {Card} from './Card';
import {CardMedia} from './CardMedia';
import {CardTitle} from './CardTitle';

const meta: Meta<typeof CardMedia> = {
  title: '4. Card/Card/CardMedia',
  component: CardMedia,
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

const COVERS: [string, string][] = [
  ['#6c5ce7', '#00b894'],
  ['#0984e3', '#6c5ce7'],
  ['#e17055', '#fdcb6e'],
  ['#00b894', '#0984e3'],
  ['#d63031', '#e17055'],
];

const cover = ([from, to]: [string, string]) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" preserveAspectRatio="none">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="480" height="360" fill="url(#g)"/>` +
    `</svg>`;
  return <img alt="" src={`data:image/svg+xml,${encodeURIComponent(svg)}`} />;
};

const Caption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return (
    <div style={{marginBottom: 8, color: styles.g(0.5)}}>
      <Eyebrow>{children}</Eyebrow>
    </div>
  );
};

const Specimen: React.FC<{label: string; width?: number; children: React.ReactNode}> = ({
  label,
  width = 360,
  children,
}) => (
  <div style={{width}}>
    <Caption>{label}</Caption>
    {children}
  </div>
);

const Stack: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 28, maxWidth: 860, alignItems: 'flex-start'}}>{children}</div>
);

const Bezel: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return <div style={{borderRadius: 14, overflow: 'hidden', border: `1px solid ${styles.g(0, 0.12)}`}}>{children}</div>;
};

const BodyText: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return <div style={{color: styles.g(0.4), fontSize: 13, lineHeight: '18px'}}>{children}</div>;
};

const Badge: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: '#fff',
      background: 'rgba(0,0,0,.45)',
      backdropFilter: 'blur(4px)',
    }}
  >
    {children}
  </span>
);

export const Top: Story = {
  render: () => (
    <Specimen label="top — full-bleed banner (16/9)" width={360}>
      <Bezel>
        <CardMedia>{cover(COVERS[0])}</CardMedia>
      </Bezel>
    </Specimen>
  ),
};

const ASPECTS = ['21/9', '16/9', '4/3', '1/1'];

export const Aspect: Story = {
  render: () => (
    <Stack>
      {ASPECTS.map((a, i) => (
        <Specimen key={a} label={a} width={200}>
          <Bezel>
            <CardMedia aspect={a}>{cover(COVERS[i % COVERS.length])}</CardMedia>
          </Bezel>
        </Specimen>
      ))}
    </Stack>
  ),
};

export const Overlay: Story = {
  render: () => (
    <Specimen label="overlay — badge + caption over the media" width={360}>
      <Bezel>
        <CardMedia
          overlay={
            <div
              style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10}}
            >
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Badge>New</Badge>
              </div>
              <div style={{color: '#fff', fontWeight: 600, fontSize: 14, textShadow: '0 1px 3px rgba(0,0,0,.6)'}}>
                Sunset over the bay
              </div>
            </div>
          }
        >
          {cover(COVERS[1])}
        </CardMedia>
      </Bezel>
    </Specimen>
  ),
};

export const Leading: Story = {
  render: () => (
    <Stack>
      <Card
        orientation="horizontal"
        width={440}
        media={
          <CardMedia placement="leading" width={120}>
            {cover(COVERS[2])}
          </CardMedia>
        }
        title={<CardTitle title="Weekend in the hills" subtitle="Trip · 3 days" />}
        body={<BodyText>Two nights, a long ridge walk, and a very cold lake.</BodyText>}
      />
      <Card
        orientation="horizontal"
        width={440}
        media={
          <CardMedia placement="leading" width={84}>
            {cover(COVERS[3])}
          </CardMedia>
        }
        title={<CardTitle title="Narrow column (84px)" subtitle="Tighter leading width" size="sm" />}
      />
    </Stack>
  ),
};

const BackgroundSpecimen: React.FC<{label: string; media: React.ReactNode}> = ({label, media}) => {
  const styles = useStyles();
  return (
    <Specimen label={label} width={360}>
      <div
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${styles.g(0, 0.12)}`,
        }}
      >
        <CardMedia placement="background">{media}</CardMedia>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 16,
          }}
        >
          <CardTitle title="Sunset over the bay" subtitle="Photo · 2 min read" />
        </div>
      </div>
    </Specimen>
  );
};

export const Background: Story = {
  render: () => (
    <Stack>
      <BackgroundSpecimen label="background — media behind text + scrim" media={cover(COVERS[1])} />
    </Stack>
  ),
};

export const InCard: Story = {
  render: () => (
    <Stack>
      <Card
        width={320}
        media={<CardMedia>{cover(COVERS[0])}</CardMedia>}
        title={<CardTitle title="Sunset over the bay" subtitle="Photo · 2 min read" />}
        body={
          <BodyText>
            A full-bleed top banner sits above the title and body, clipped to the card's rounded corners.
          </BodyText>
        }
      />
      <Card
        width={320}
        density="dense"
        media={<CardMedia>{cover(COVERS[1])}</CardMedia>}
        title={<CardTitle title="Dense → 21/9 banner" subtitle="Aspect tracks density" />}
      />
    </Stack>
  ),
};
