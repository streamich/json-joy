import * as React from 'react';
import {Chip} from '.';
import {Link} from '../Link';
import {useStyles} from '../../styles/context';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Chip> = {
  title: '1. Inline/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// ── Inline Lucide-style side icons (story fixtures; `currentColor` so they take
// the chip's text color) ──
type IconProps = {size?: number};
const svg = (size: number, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);
const FileText: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>,
  );
const Paperclip: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 17a1.6 1.6 0 0 1-2.3-2.3l7.6-7.6" />,
  );
const MapPin: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>,
  );
const Calendar: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>,
  );
const LinkIcon: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </>,
  );
const Hash: React.FC<IconProps> = ({size = 15}) => svg(size, <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />);
const Package: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>,
  );
const ImageIcon: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m21 16-5-5L5 21" />
    </>,
  );
const Clock: React.FC<IconProps> = ({size = 15}) =>
  svg(
    size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
  );

const Row: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', maxWidth: 560}}>{children}</div>
);

/** Identity token with an avatar — e.g. an @mention. */
export const WithAvatar: Story = {
  args: {
    avatar: {name: 'Alice Johnson'},
    children: 'Alice Johnson',
    onClick: () => {},
  },
};

/** The avatar can be an emoji. */
export const WithEmoji: Story = {
  args: {
    avatar: {emoji: '🦊'},
    children: 'Foxes',
    onClick: () => {},
  },
};

/** A status dot instead of an avatar. */
export const WithDot: Story = {
  args: {
    dot: 'success',
    children: 'Online',
  },
};

/** A leading icon — for tokens that aren't a person or a status (a file, a
 * place, a link, …). The icon is sized to the avatar/dot mark box. */
export const WithIcon: Story = {
  args: {
    icon: <Paperclip />,
    children: '2 files',
    onClick: () => {},
  },
};

/** Removable token — e.g. a tag in a tag input. */
export const Removable: Story = {
  args: {
    avatar: {name: 'bug'},
    children: 'bug',
    onRemove: () => {},
  },
};

/** Compact variant for dense inline use. */
export const Small: Story = {
  args: {
    avatar: {name: 'Tag'},
    children: 'small chip',
    small: true,
    onClick: () => {},
  },
};

/** Every leading-mark type in one place: avatar, emoji, status dots, a variety
 * of side icons, and the bare (mark-less) chip. */
export const MarkTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
      <Row>
        <Chip roundness={0.5} avatar={{name: 'Alice Johnson'}}>
          Alice
        </Chip>
        <Chip avatar={{emoji: '🦊'}}>Foxes</Chip>
        <Chip dot="success">Online</Chip>
        <Chip dot="warning">Away</Chip>
        <Chip dot="error">Offline</Chip>
        <Chip dot="accent">Live</Chip>
        <Chip>No mark</Chip>
      </Row>
      <Row>
        <Chip icon={<FileText />}>spec-v2.pdf</Chip>
        <Chip icon={<Paperclip />}>2 files</Chip>
        <Chip icon={<MapPin />}>Berlin</Chip>
        <Chip icon={<Calendar />}>Jun 24</Chip>
        <Chip icon={<LinkIcon />}>
          <Link a external to="https://jsonjoy.com">
            jsonjoy.com
          </Link>
        </Chip>
        <Chip icon={<Hash />}>design</Chip>
        <Chip icon={<Package />}>Field Tote</Chip>
        <Chip icon={<ImageIcon />}>cover.png</Chip>
        <Chip icon={<Clock />}>2h ago</Chip>
      </Row>
      <Row>
        <Chip small icon={<FileText />}>
          spec.pdf
        </Chip>
        <Chip small icon={<MapPin />}>
          Berlin
        </Chip>
        <Chip small dot="success">
          Online
        </Chip>
        <Chip small avatar={{name: 'Alice'}}>
          Alice
        </Chip>
      </Row>
    </div>
  ),
};

/** `color` tones the chip — a soft tint of the color as the background, the
 * color itself as the foreground (label + `currentColor` icon). */
const ColoredRow: React.FC = () => {
  const styles = useStyles();
  return (
    <Row>
      <Chip color={styles.negative + ''} icon={<Hash />}>
        danger
      </Chip>
      <Chip color={styles.warning + ''} icon={<Calendar />}>
        warning
      </Chip>
      <Chip color={styles.positive + ''} dot="success">
        success
      </Chip>
      <Chip color={styles.info + ''} icon={<MapPin />}>
        info
      </Chip>
      <Chip color={styles.accent + ''} avatar={{name: 'Alice'}}>
        accent
      </Chip>
    </Row>
  );
};
export const Colored: Story = {render: () => <ColoredRow />};

/** `roundness` (0–1) tunes the corner radius: ~0.5 is the default look, lower is
 * squarer, higher is rounder/pill. Drag the control to morph the corners. */
export const Roundness: Story = {
  args: {
    icon: <Calendar />,
    children: 'Roundness',
    roundness: 0.5,
  },
  argTypes: {
    roundness: {control: {type: 'range', min: 0, max: 1, step: 0.05}},
  },
};

/** The full `roundness` scale, squarish → pill. (`0` means "unset" — it falls
 * back to the ambient/default radius, so the scale starts just above it.) */
export const RoundnessScale: Story = {
  render: () => (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end'}}>
      {[0.1, 0.3, 0.5, 0.7, 0.9, 1].map((r) => (
        <div key={r} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
          <Chip icon={<Calendar />} roundness={r}>
            Event
          </Chip>
          <span style={{fontFamily: 'monospace', fontSize: 11, opacity: 0.6}}>{r.toFixed(2)}</span>
        </div>
      ))}
    </div>
  ),
};
