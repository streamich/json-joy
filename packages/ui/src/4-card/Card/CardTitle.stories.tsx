import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {useStyles} from '../../styles/context';
import {Eyebrow} from '../../1-inline/Eyebrow';
import {Card} from './Card';
import {CardTitle} from './CardTitle';

const meta: Meta<typeof CardTitle> = {
  title: '4. Card/Card/CardTitle',
  component: CardTitle,
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

const longTitle = 'Tune the card hover transition so it feels instant without dropping frames on low-end devices';

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
  width = 320,
  children,
}) => (
  <div style={{width}}>
    <Caption>{label}</Caption>
    {children}
  </div>
);

const Stack: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 28, maxWidth: 820}}>{children}</div>
);

const Frame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${styles.g(0, 0.12)}`,
        background: styles.g(0, 0.02),
      }}
    >
      {children}
    </div>
  );
};

export const Sizes: Story = {
  render: () => (
    <Stack>
      <Specimen label="sm — list / compact row">
        <Frame>
          <CardTitle size="sm" title="Tune the hover transition" subtitle="Updated 2h ago" />
        </Frame>
      </Specimen>
      <Specimen label="md — standard card">
        <Frame>
          <CardTitle size="md" title="Tune the hover transition" subtitle="Updated 2h ago" />
        </Frame>
      </Specimen>
      <Specimen label="lg — title-forward / article">
        <Frame>
          <CardTitle size="lg" title="Tune the hover transition" subtitle="Updated 2h ago" />
        </Frame>
      </Specimen>
    </Stack>
  ),
};

export const TitleAndSubtitle: Story = {
  render: () => (
    <Stack>
      <Specimen label="title only (the irreducible card)">
        <CardTitle size="md" title="Quarterly planning" />
      </Specimen>
      <Specimen label="title + subtitle">
        <CardTitle size="md" title="Jules Maron" subtitle="@jules · Product" />
      </Specimen>
    </Stack>
  ),
};

export const Clamp: Story = {
  render: () => (
    <Stack>
      <Specimen label="clamp 1">
        <CardTitle size="md" title={longTitle} clamp={1} />
      </Specimen>
      <Specimen label="clamp 2">
        <CardTitle size="md" title={longTitle} clamp={2} />
      </Specimen>
      <Specimen label="clamp 3">
        <CardTitle size="md" title={longTitle} clamp={3} />
      </Specimen>
      <Specimen label="no clamp (wraps, balanced)">
        <CardTitle size="md" title={longTitle} />
      </Specimen>
    </Stack>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Stack>
      <Specimen label="href — hover to underline">
        <CardTitle size="md" title="Open the pull request" href="#" subtitle="github.com/streamich/json-joy" />
      </Specimen>
    </Stack>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Stack>
      <Specimen label="onClick — pointer cursor">
        <CardTitle size="md" title="Tap to expand" subtitle="Secondary affordance" onClick={() => {}} />
      </Specimen>
    </Stack>
  ),
};

const DENSITIES = [
  {density: 'comfortable', derived: 'md'},
  {density: 'compact', derived: 'sm'},
  {density: 'dense', derived: 'sm'},
] as const;

export const Density: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      {DENSITIES.map(({density, derived}) => (
        <div key={density} style={{width: 360}}>
          <Caption>
            {density} → {derived}
          </Caption>
          <Card density={density} title={<CardTitle title="Tune the hover transition" subtitle="Updated 2h ago" />} />
        </div>
      ))}
    </div>
  ),
};
