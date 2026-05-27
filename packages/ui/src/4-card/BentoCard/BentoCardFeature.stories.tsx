import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {BentoCardFeature} from './BentoCardFeature';
import type {ContentFeature} from '../../6-page/FeatureLayout/types';

const meta: Meta<typeof BentoCardFeature> = {
  title: '4. Card/BentoCard/BentoCardFeature',
  component: BentoCardFeature,
  parameters: {layout: 'centered'},
};

export default meta;

const jsonFeature: ContentFeature = {
  id: 'json-crdt',
  name: 'JSON',
  eyebrow: 'JSON CRDT',
  color: '#07f',
  subtitle: 'Model app state as nested objects, arrays, and maps. The whole document is one mergeable JSON CRDT.',
  primaryCta: {label: 'Explore JSON CRDT', to: '/json-crdt'},
};

// No `color` set - the card derives one by hashing the feature id.
const textFeature: ContentFeature = {
  id: 'plain-text',
  name: 'Text',
  eyebrow: 'collaborative text',
  subtitle:
    'The fastest RGA-based text CRDT for collaborative text synchronization, with drop-in bindings for every editor.',
  primaryCta: {label: 'Explore plain text', to: '/plain-text'},
};

export const Primary: StoryObj<typeof BentoCardFeature> = {
  render: () => (
    <BentoCardFeature
      feature={jsonFeature}
      animation="dots"
      style={{width: 380, height: 560}}
      onExpand={() => console.log('expand', jsonFeature.id)}
    />
  ),
};

export const DerivedColor: StoryObj<typeof BentoCardFeature> = {
  render: () => (
    <BentoCardFeature
      feature={textFeature}
      animation="rays"
      style={{width: 380, height: 560}}
      onExpand={() => console.log('expand', textFeature.id)}
    />
  ),
};
