import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {useStyles} from '../../styles/context';
import {Avatar} from '../../1-inline/Avatar';
import {AvatarStack} from '../../1-inline/AvatarStack';
import {Pill} from '../../1-inline/Pill';
import {BasicButton} from '../../2-inline-block/BasicButton';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {Check} from '../../1-inline/Check';
import {
  Card,
  CardHeader,
  CardMedia,
  CardTitle,
  CardBody,
  CardSectionList,
  CardChildren,
  CardRelations,
  CardFooter,
  toneColor,
  type CardSection,
} from '.';
import {Eyebrow} from '../../1-inline/Eyebrow';
import {StatusPill} from '../../1-inline/StatusPill';
import {Chip} from '../../1-inline/Chip';
import {TypeBadge} from '../../1-inline/TypeBadge';
import {PriorityTag} from '../../1-inline/PriorityTag';
import {Reaction} from '../../1-inline/Reaction';

const meta: Meta<typeof Card> = {
  title: '4. Card/Card',
  component: Card,
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────────────────────────
// Inline Lucide-style icons (story fixtures; `currentColor` so they take the
// color the host slot sets).
// ─────────────────────────────────────────────────────────────────────────────
type IconProps = {size?: number};
const svg = (size: number, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);
const CircleDot: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </>,
  );
const FileText: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>,
  );
const Calendar: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>,
  );
const MapPin: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>,
  );
const Package: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>,
  );
const Paperclip: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 17a1.6 1.6 0 0 1-2.3-2.3l7.6-7.6" />,
  );
const Layers: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>,
  );
const Star: React.FC<IconProps> = ({size = 24}) =>
  svg(size, <path d="m12 3 2.6 5.6L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.7L12 3Z" />);
const User: React.FC<IconProps> = ({size = 24}) =>
  svg(
    size,
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>,
  );
const Activity: React.FC<IconProps> = ({size = 24}) => svg(size, <path d="M3 12h4l3 8 4-16 3 8h4" />);
const Download: React.FC<IconProps> = ({size = 16}) => svg(size, <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />);
const Plus: React.FC<IconProps> = ({size = 16}) => svg(size, <path d="M12 5v14M5 12h14" />);

// A neutral gradient "media" placeholder with an overlay label.
const MediaPlaceholder: React.FC<{label: string; icon?: React.ReactNode}> = ({label, icon}) => {
  const styles = useStyles();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: styles.g(0.55),
        background: `repeating-linear-gradient(135deg, ${styles.gN(0, 0.01)} 0 12px, ${styles.gN(0, 0.02)} 12px 24px)`,
      }}
    >
      {icon ?? <Eyebrow>{label}</Eyebrow>}
    </div>
  );
};

const Frame: React.FC<{width?: number; children: React.ReactNode}> = ({width = 340, children}) => (
  <div style={{width}}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Identity (a Person card): the irreducible card — icon + title + subtitle.
// ─────────────────────────────────────────────────────────────────────────────
const IdentityCard: React.FC = () => (
  <Frame width={300}>
    <Card
      interactive
      header={
        <CardHeader
          icon={<Avatar name="Jules Maron" width={44} />}
          title={<CardTitle title="Jules Maron" subtitle="@jules · Design Systems" size="md" />}
        />
      }
      relations={
        <CardRelations>
          <StatusPill tone="success" label="Online" />
          <Chip icon={<MapPin size={14} />}>Berlin</Chip>
        </CardRelations>
      }
    />
  </Frame>
);
export const Identity: Story = {render: () => <IdentityCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Entity (a Task card): the full anatomy — header identity, title +
// description, reference graph, footer meta, with an accent edge.
// ─────────────────────────────────────────────────────────────────────────────
const EntityCard: React.FC = () => {
  const styles = useStyles();
  return (
    <Frame>
      <Card
        interactive
        accent={styles.brand2 + ''}
        header={
          <CardHeader
            icon={<TypeBadge icon={<CircleDot />} />}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
            menu={<BasicButtonMore />}
          />
        }
        title={<CardTitle title="Tune the card hover transition" subtitle="Spring settles under 200ms" />}
        body={
          <CardBody clamp={3}>
            Lift feels heavy at 320ms — try a faster spring and a subtler shadow ramp so it degrades gracefully.
          </CardBody>
        }
        relations={
          <CardRelations>
            <Chip avatar={{name: 'Jules Maron'}}>Jules</Chip>
            <Chip icon={<Paperclip size={14} />}>2 files</Chip>
            <PriorityTag level="urgent" label="Urgent" />
          </CardRelations>
        }
        footer={
          <CardFooter
            start={
              <>
                <Pill small color="accent">
                  #hover
                </Pill>
                <Pill small>#motion</Pill>
              </>
            }
            end={<span>upd 2h ago</span>}
          />
        }
      />
    </Frame>
  );
};
export const Entity: Story = {render: () => <EntityCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 3 — Media (a Product card): media-forward, price + rating + an action.
// ─────────────────────────────────────────────────────────────────────────────
const MediaCard: React.FC = () => {
  const styles = useStyles();
  return (
    <Frame width={320}>
      <Card
        interactive
        media={
          <CardMedia aspect={16 / 10}>
            <MediaPlaceholder label="product shot" />
          </CardMedia>
        }
        header={
          <CardHeader icon={<TypeBadge icon={<Package />} variant="plain" />} eyebrow={<Eyebrow>Product</Eyebrow>} />
        }
        title={
          <CardTitle
            title="Field Tote — Waxed Canvas"
            subtitle={
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: styles.g(0.4)}}>
                <Star size={13} /> 4.8 · 214 reviews
              </span>
            }
          />
        }
        relations={
          <CardRelations>
            <StatusPill tone="success" label="In stock" />
            <Chip>Atlas Goods</Chip>
          </CardRelations>
        }
        footer={
          <CardFooter
            start={<span style={{color: styles.g(0.08), fontWeight: 600, fontSize: 17}}>$148</span>}
            end={
              <BasicButton
                type="button"
                width="auto"
                height={30}
                rounder
                style={{
                  gap: 5,
                  fontWeight: 600,
                  fontSize: 13,
                  color: styles.light ? '#fff' : styles.g(0.04),
                  background: styles.accent + '',
                }}
              >
                <Plus /> Add
              </BasicButton>
            }
          />
        }
      />
    </Frame>
  );
};
export const Media: Story = {render: () => <MediaCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — File (an attachment, facet:'file'): file icon + name + meta + download.
// ─────────────────────────────────────────────────────────────────────────────
const FileCard: React.FC = () => (
  <Frame width={320}>
    <Card
      surface="outline"
      header={
        <CardHeader
          icon={<TypeBadge icon={<FileText />} />}
          eyebrow={<Eyebrow>File · PDF</Eyebrow>}
          menu={<BasicButtonMore />}
        />
      }
      title={<CardTitle title="spec-v2.pdf" subtitle="2.4 MB · uploaded May 2" size="sm" />}
      footer={
        <CardFooter
          end={
            <BasicButton aria-label="Download" round size={30}>
              <Download />
            </BasicButton>
          }
        />
      }
    />
  </Frame>
);
export const File: Story = {render: () => <FileCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Document (an Article card): eyebrow, big title, excerpt, byline footer.
// ─────────────────────────────────────────────────────────────────────────────
const DocumentCard: React.FC = () => (
  <Frame>
    <Card
      interactive
      header={
        <CardHeader
          icon={<TypeBadge icon={<FileText />} />}
          eyebrow={<Eyebrow>Article · Essay</Eyebrow>}
          menu={<BasicButtonMore />}
        />
      }
      title={<CardTitle title="A field guide to composable cards" size="lg" clamp={3} />}
      body={
        <CardBody clamp={3}>
          Why one anatomy beats a hundred bespoke layouts — and how references keep the graph alive without bloating any
          single view.
        </CardBody>
      }
      footer={
        <CardFooter
          start={<Chip avatar={{name: 'Jules Maron'}}>Jules Maron</Chip>}
          end={
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 10}}>
              <span>8 min read</span>
              <Reaction emoji="❤️" count={128} />
            </span>
          }
        />
      }
    />
  </Frame>
);
export const Document: Story = {render: () => <DocumentCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 6 — Container (a Folder card): boxed children one level down (gallery).
// ─────────────────────────────────────────────────────────────────────────────
const ChildCard: React.FC<{title: string; icon: React.ReactNode; eyebrow: string}> = ({title, icon, eyebrow}) => (
  <Card
    surface="outline"
    density="compact"
    interactive
    header={<CardHeader icon={<TypeBadge icon={icon} size={28} />} eyebrow={<Eyebrow>{eyebrow}</Eyebrow>} />}
    title={<CardTitle title={title} size="sm" clamp={2} />}
  />
);
const ContainerCard: React.FC = () => (
  <Frame width={420}>
    <Card
      header={
        <CardHeader
          icon={<TypeBadge icon={<Layers />} />}
          eyebrow={<Eyebrow>Collection</Eyebrow>}
          identifier="4 items"
          menu={<BasicButtonMore />}
        />
      }
      title={<CardTitle title="Design System" subtitle="Cards, tokens & motion" />}
      body={
        <CardChildren layout="gallery">
          <ChildCard eyebrow="Task" title="Tune hover transition" icon={<CircleDot />} />
          <ChildCard eyebrow="Doc" title="Composable cards" icon={<FileText />} />
          <ChildCard eyebrow="Event" title="Office hours" icon={<Calendar />} />
          <ChildCard eyebrow="Place" title="Atlas HQ · Room 3" icon={<MapPin />} />
        </CardChildren>
      }
    />
  </Frame>
);
export const Container: Story = {render: () => <ContainerCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 7 — Promoted (the property card): a field list with a promoted inner thing
// hoisted in as a labeled eyebrow group.
// ─────────────────────────────────────────────────────────────────────────────
const PromotedCard: React.FC = () => {
  const styles = useStyles();
  const sections: CardSection[] = [
    {
      label: 'Assignee',
      icon: <User size={16} />,
      content: <Chip avatar={{name: 'Jules Maron'}}>Jules Maron</Chip>,
      editable: true,
    },
    {
      label: 'Priority',
      icon: <Activity size={16} />,
      content: <PriorityTag level="urgent" label="Urgent" plain />,
      editable: true,
    },
    {
      label: 'Due date',
      icon: <Calendar size={16} />,
      content: (
        <Pill small color="warning">
          Tomorrow
        </Pill>
      ),
      editable: true,
    },
    {
      kind: 'promoted',
      label: 'Attachment',
      action: (
        <BasicButton aria-label="Download" round size={26}>
          <Download />
        </BasicButton>
      ),
      sections: [
        {label: 'name', content: 'spec-v2.pdf'},
        {label: 'type', content: 'PDF · 2.4 MB'},
        {label: 'uploaded', content: 'May 2'},
      ],
    },
  ];
  return (
    <Frame width={360}>
      <Card
        accent={styles.brand2 + ''}
        header={
          <CardHeader
            icon={<TypeBadge icon={<CircleDot />} />}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
          />
        }
        title={<CardTitle title="Tune the card hover transition" />}
        body={<CardSectionList sections={sections} />}
      />
    </Frame>
  );
};
export const Promoted: Story = {render: () => <PromotedCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 8 — Stat (a metric card, facet:'metadata'): one big number + delta.
// ─────────────────────────────────────────────────────────────────────────────
const StatCard: React.FC = () => {
  const styles = useStyles();
  return (
    <Frame width={240}>
      <Card
        interactive
        header={
          <CardHeader
            icon={<TypeBadge icon={<Activity />} variant="plain" />}
            eyebrow={<Eyebrow>Active users</Eyebrow>}
          />
        }
        body={
          <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2}}>
            <span style={{fontSize: 34, fontWeight: 700, letterSpacing: '-.02em', color: styles.g(0.06)}}>12,480</span>
            <StatusPill tone="success" shape="none" small label="▲ 8.2%" />
          </div>
        }
        footer={<CardFooter end={<span>vs. last week</span>} />}
      />
    </Frame>
  );
};
export const Stat: Story = {render: () => <StatCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 9 — Row (the list altitude): horizontal + dense + outline, title in header.
// ─────────────────────────────────────────────────────────────────────────────
const RowCard: React.FC = () => (
  <Frame width={460}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Card
        surface="outline"
        density="dense"
        interactive
        header={
          <CardHeader
            icon={<TypeBadge icon={<CircleDot />} size={24} />}
            identifier="ENG-241"
            title={<CardTitle title="Tune the card hover transition" size="sm" clamp={1} />}
            status={<StatusPill tone="warning" shape="ring" small label="Active" />}
            meta="JM"
          />
        }
      />
      <Card
        surface="outline"
        density="dense"
        interactive
        header={
          <CardHeader
            icon={<TypeBadge icon={<FileText />} size={24} />}
            identifier="DOC-12"
            title={<CardTitle title="A field guide to composable cards" size="sm" clamp={1} />}
            status={<StatusPill tone="success" shape="check" small label="Done" />}
            meta="8m"
          />
        }
      />
    </div>
  </Frame>
);
export const Row: Story = {render: () => <RowCard />};

// ─────────────────────────────────────────────────────────────────────────────
// 10 — Picker (selectable card): a selection control + selected ring.
// ─────────────────────────────────────────────────────────────────────────────
const PickerCard: React.FC = () => {
  const [picked, setPicked] = React.useState<Record<string, boolean>>({a: true});
  const item = (id: string, name: string, role: string) => (
    <Frame width={300}>
      <Card
        selected={picked[id]}
        onClick={() => setPicked((p) => ({...p, [id]: !p[id]}))}
        selectable={<Check checked={picked[id]} />}
        header={
          <CardHeader
            icon={<Avatar name={name} width={40} />}
            title={<CardTitle title={name} subtitle={role} size="md" />}
          />
        }
      />
    </Frame>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      {item('a', 'Jules Maron', 'Design Systems')}
      {item('b', 'Ana Lima', 'Engineering')}
    </div>
  );
};
export const Picker: Story = {render: () => <PickerCard />};

// ─────────────────────────────────────────────────────────────────────────────
// Frame showcases
// ─────────────────────────────────────────────────────────────────────────────
const Sample: React.FC<{
  surface?: 'paper' | 'outline' | 'ghost' | 'bare';
  density?: 'comfortable' | 'compact' | 'dense';
  tone?: 'default' | 'error' | 'warning' | 'success' | 'info';
}> = (p) => {
  const styles = useStyles();
  // When the card carries a tone, the caller tints the type icon to match (soft
  // hue tile + hue glyph) — the shell stays agnostic about its slot contents.
  const tc = toneColor(styles, p.tone);
  return (
    <Card
      surface={p.surface}
      density={p.density}
      tone={p.tone}
      interactive
      header={
        <CardHeader
          icon={<TypeBadge icon={<CircleDot />} size={p.density === 'dense' ? 24 : 32} color={tc} />}
          eyebrow={<Eyebrow>Task</Eyebrow>}
          identifier="ENG-241"
        />
      }
      title={<CardTitle title="Tune the card hover transition" clamp={2} />}
      body={<CardBody clamp={2}>A faster spring and a subtler shadow ramp.</CardBody>}
    />
  );
};

const Grid: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 300px)', gap: 20}}>{children}</div>
);

export const Surfaces: Story = {
  render: () => (
    <Grid>
      <Sample surface="paper" />
      <Sample surface="outline" />
      <Sample surface="ghost" />
      <Sample surface="bare" />
    </Grid>
  ),
};

export const Density: Story = {
  render: () => (
    <Grid>
      <Sample density="comfortable" />
      <Sample density="compact" />
      <Sample density="dense" />
    </Grid>
  ),
};

export const Tones: Story = {
  render: () => (
    <Grid>
      <Sample tone="error" />
      <Sample tone="warning" />
      <Sample tone="success" />
      <Sample tone="info" />
    </Grid>
  ),
};

// Horizontal: media as a leading column.
const HorizontalCard: React.FC = () => (
  <Frame width={460}>
    <Card
      orientation="horizontal"
      interactive
      media={
        <CardMedia placement="leading" width={130}>
          <MediaPlaceholder
            label="cover"
            icon={
              <span style={{opacity: 0.5}}>
                <Calendar size={26} />
              </span>
            }
          />
        </CardMedia>
      }
      header={
        <CardHeader
          eyebrow={<Eyebrow>Event</Eyebrow>}
          identifier="Jun 24"
          status={<StatusPill tone="accent" label="Upcoming" />}
        />
      }
      title={<CardTitle title="Design System Office Hours" subtitle="Tue · 4:00–5:00 PM" size="md" />}
      relations={
        <CardRelations>
          <AvatarStack gap={-8}>
            <Avatar name="Jules Maron" width={24} />
            <Avatar name="Ana Lima" width={24} />
            <Avatar name="+9" width={24} grey />
          </AvatarStack>
        </CardRelations>
      }
    />
  </Frame>
);
export const Horizontal: Story = {render: () => <HorizontalCard />};

// Background media with a legibility scrim.
const BackgroundCard: React.FC = () => (
  <Frame width={320}>
    <Card
      interactive
      style={{minHeight: 200}}
      media={
        <CardMedia placement="background">
          <MediaPlaceholder label="cover" />
        </CardMedia>
      }
      header={
        <CardHeader
          icon={<TypeBadge icon={<MapPin />} variant="plain" />}
          eyebrow={<Eyebrow>Place</Eyebrow>}
          status={<StatusPill tone="success" label="Open now" />}
        />
      }
      title={<CardTitle title="Reading Room Café" subtitle="Coffee · Workspace · €€" />}
    />
  </Frame>
);
export const BackgroundMedia: Story = {render: () => <BackgroundCard />};

// Frame states.
export const States: Story = {
  render: () => (
    <Grid>
      <Sample />
      <Card
        selected
        interactive
        header={<CardHeader icon={<TypeBadge icon={<CircleDot />} />} eyebrow={<Eyebrow>Selected</Eyebrow>} />}
        title={<CardTitle title="Selected card" />}
      />
      <Card
        busy
        header={<CardHeader icon={<TypeBadge icon={<CircleDot />} />} eyebrow={<Eyebrow>Loading</Eyebrow>} />}
        title={<CardTitle title="Busy / skeleton" />}
        body={<CardBody>Loading…</CardBody>}
      />
      <Card
        disabled
        interactive
        header={<CardHeader icon={<TypeBadge icon={<CircleDot />} />} eyebrow={<Eyebrow>Disabled</Eyebrow>} />}
        title={<CardTitle title="Disabled card" />}
      />
    </Grid>
  ),
};
