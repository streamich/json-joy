import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {CollabIllustrationJson} from '../../5-block/CollabIllustration/Json';
import {CollabIllustrationJsonSmall} from '../../5-block/CollabIllustration/JsonSmall';
import {FeatureLayout} from '.';
import type {ContentFeature} from './types';

const meta: Meta<typeof FeatureLayout> = {
  title: '6. Page/FeatureLayout',
  component: FeatureLayout,
  parameters: {layout: 'fullscreen'},
};

export default meta;

const slug = 'json-crdt';

export const jsonCrdtPage: ContentFeature = {
  name: 'JSON',
  eyebrow: 'JSON CRDT',
  slug,
  to: '/' + slug,
  showInMenu: true,
  title: 'Your whole app state, mergeable',
  subtitle:
    'Model full application or document state as conflict-free JSON. Concurrent edits from multiple users, devices, tabs, and offline sessions merge cleanly.',
  about: 'A conflict-free JSON document that stays plain JSON to your app.',
  highlights: [
    'The entire document is conflict-free, not just text fields',
    'Objects, arrays, strings, numbers, and binary all merge',
    'Local-first and offline by default',
    'Open JSON CRDT and JSON CRDT Patch specifications',
  ],
  primaryCta: {label: 'Read the JSON CRDT spec', to: '/specs/json-crdt'},
  secondaryCta: {label: 'Open the playground', to: 'https://explorer.jsoncrdt.org'},
  visual: () => <CollabIllustrationJson />,
  visualSmall: () => <CollabIllustrationJsonSmall />,
  stats: [
    {value: '100x', unit: 'faster', label: 'on list edits vs other JavaScript CRDTs, by benchmark'},
    {value: '100%', label: 'conflict-free merges, fuzz-tested for convergence'},
  ],
  valueProps: [
    {
      icon: {set: 'lucide', icon: 'git-merge'},
      title: 'Conflict-free by design',
      body: 'Any state you can express as JSON becomes collaborative and local-first without writing merge logic yourself.',
    },
    {
      icon: {set: 'lucide', icon: 'gauge'},
      title: 'Low overhead',
      body: 'Prunes everything not needed for merges. Stored documents can be smaller than the equivalent plain JSON.',
    },
    {
      icon: {set: 'lucide', icon: 'shield-check'},
      title: 'Engineered, not demonstrated',
      body: 'Built on RGA, the most studied sequence CRDT, fuzz-tested for convergence and benchmarked for speed.',
    },
  ],
  related: [
    {title: 'Plain text', body: 'Make any text field collaborative.', to: '/plain-text'},
    {title: 'Rich text', body: 'Rich text that merges, not conflicts.', to: '/rich-text'},
    {title: 'Specifications', body: 'Open JSON CRDT and JSON CRDT Patch specs.', to: '/specs/json-crdt'},
  ],
  children: [],
};

export const Primary: StoryObj<typeof FeatureLayout> = {
  render: () => (
    <div style={{maxWidth: 960, margin: '0 auto'}}>
      <FeatureLayout feature={jsonCrdtPage} />
    </div>
  ),
};
