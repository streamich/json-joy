import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Thumbnail as Component} from '.';
import {Iconista} from '../../icons/Iconista';

/** A self-contained image so stories render without a network. */
const sample = (bg: string, accent = '#fff') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
      `<rect width="160" height="160" fill="${bg}"/>` +
      `<circle cx="80" cy="64" r="34" fill="${accent}" opacity="0.9"/>` +
      `<rect x="24" y="108" width="112" height="44" rx="16" fill="${accent}" opacity="0.9"/>` +
      '</svg>',
  );

const meta: Meta<typeof Component> = {
  title: '2. Inline Block/Thumbnail',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {control: 'text'},
    aspect: {control: 'text'},
    shape: {control: 'inline-radio', options: ['rect', 'rounded']},
    width: {control: 'number'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    src: sample('#6c5ce7'),
    alt: 'Preview',
    width: 96,
  },
};

/** Falls back to a neutral placeholder when there's no `src`. */
export const Placeholder: Story = {
  args: {
    width: 96,
    children: <Iconista set="tabler" icon="photo" width={28} height={28} />,
  },
};

/** Aspect ratios — `aspect` is `w/h`. */
export const Aspects: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'flex-start'}}>
      <Component src={sample('#6c5ce7')} aspect={1} width={96} />
      <Component src={sample('#00b894')} aspect={16 / 9} width={140} />
      <Component src={sample('#e17055')} aspect={3 / 4} width={84} />
    </div>
  ),
};

/** `rounded` softens the corners; `rect` keeps them square. */
export const Shapes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component src={sample('#0984e3')} shape="rounded" width={96} />
      <Component src={sample('#0984e3')} shape="rect" width={96} />
    </div>
  ),
};

/** A corner `badge` overlays a token — format, duration, count. */
export const WithBadge: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <Component
        src={sample('#2d3436')}
        width={120}
        aspect={16 / 9}
        badge={
          <span
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: 5,
            }}
          >
            2:14
          </span>
        }
      />
      <Component
        src={sample('#6c5ce7')}
        width={96}
        badge={
          <span
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: 5,
            }}
          >
            PNG
          </span>
        }
      />
    </div>
  ),
};

/** Clickable. */
export const Clickable: Story = {
  args: {
    src: sample('#00b894'),
    width: 96,
    onClick: () => {},
  },
};
