import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Eyebrow} from '../../../1-inline/Eyebrow';
import {TypeBadge} from '../../../1-inline/TypeBadge';
import {BasicButtonMore} from '../../../2-inline-block/BasicButton/BasicButtonMore';
import {Iconista} from '../../../icons/Iconista';
import {useStyles} from '../../../styles/context';
import {CardHeader, CardTitle, Card as UiCard} from '../../Card';
import {ContextPane} from '../../ContextMenu/ContextPane';
import type {MenuItem, Param} from '../../StructuralMenu/types';
import {FieldList} from '../index';

const meta: Meta = {
  title: '4. Card/Fields/Variants',
  parameters: {layout: 'centered'},
};

export default meta;

const icon = (name: string) => () => <Iconista width={15} height={15} set="tabler" icon={name as never} />;

// Sample per-field row actions (rendered as a ToolbarMenu on hover) supplied
// directly on the field descriptor via `.actions`.
const commentAction: MenuItem = {name: 'Comment', icon: icon('message'), onSelect: () => console.log('comment')};
const copyAction: MenuItem = {name: 'Copy', icon: icon('copy'), onSelect: () => console.log('copy')};

const params: (Param | MenuItem)[] = [
  {
    kind: 'bool',
    id: 'selected',
    name: 'Selected',
    default: false,
    variant: 'check',
    icon: icon('check'),
    actions: [commentAction],
  },
  {
    kind: 'bool',
    id: 'pinned',
    name: 'Pinned',
    default: null,
    icon: icon('pin'),
    label: (on) => (on === null ? 'Not set' : on ? 'Pinned' : 'Not pinned'),
  },
  {
    kind: 'str',
    id: 'title',
    name: 'Title',
    default: 'Ship v2',
    min: 4,
    max: 80,
    icon: icon('forms'),
    actions: [commentAction, copyAction],
  },
  {
    kind: 'str',
    id: 'description',
    name: 'Description',
    multiline: true,
    default: 'Unify the design system and component library.\nSecond phase migrates the documentation.',
    icon: icon('align-left'),
  },
  {
    kind: 'select',
    id: 'status',
    name: 'Status',
    default: 'doing',
    icon: icon('flag'),
    options: [
      {name: 'Todo', id: 'todo'},
      {name: 'Doing', id: 'doing'},
      {name: 'Done', id: 'done'},
    ],
    actions: [commentAction],
  },
  {
    // Multi-select: `max > 1` makes it multiple (value is a string[]); `min`
    // shows a validity marker when unmet. At `max` unselected options disable.
    kind: 'select',
    id: 'labels',
    name: 'Labels',
    max: 4,
    min: 1,
    default: ['bug', 'ux'],
    icon: icon('tags'),
    options: [
      {name: 'Bug', id: 'bug', color: '#e5484d'},
      {name: 'Feature', id: 'feature', color: '#30a46c'},
      {name: 'UX', id: 'ux', color: '#0091ff'},
      {name: 'Docs', id: 'docs', color: '#f76b15'},
      {name: 'Infra', id: 'infra', color: '#8e4ec6'},
      {name: 'Chore', id: 'chore', color: '#978365'},
    ],
    actions: [commentAction],
  },
  {
    // Second multi-select: unbounded (`max: Infinity`, no cap) and under `min`
    // by default (1 of 2 required) so the validity marker shows; 6+ options
    // auto-enable search, and option icons flow through to the chips.
    kind: 'select',
    id: 'assignees',
    name: 'Assignees',
    max: Number.POSITIVE_INFINITY,
    min: 2,
    default: ['alice'],
    icon: icon('users'),
    options: [
      {name: 'Alice', id: 'alice', icon: icon('user')},
      {name: 'Bob', id: 'bob', icon: icon('user')},
      {name: 'Carol', id: 'carol', icon: icon('user')},
      {name: 'Dave', id: 'dave', icon: icon('user')},
      {name: 'Erin', id: 'erin', icon: icon('user')},
      {name: 'Frank', id: 'frank', icon: icon('user')},
    ],
    actions: [copyAction],
  },
  {
    kind: 'num',
    id: 'estimate',
    name: 'Estimate',
    default: 5,
    min: 0,
    max: 40,
    unit: 'h',
    icon: icon('clock'),
    actions: [copyAction],
  },
  {
    kind: 'date',
    id: 'due',
    name: 'Due date',
    optional: true,
    default: '2026-07-24',
    min: '2026-07-01',
    icon: icon('calendar'),
    actions: [commentAction],
  },
  {
    kind: 'date',
    id: 'updated',
    name: 'Updated',
    time: true,
    relative: true,
    readonly: true,
    default: '2026-07-08T16:45',
    icon: icon('history'),
  },
  {kind: 'color', id: 'color', name: 'Color', default: '#0077ff', icon: icon('palette'), actions: [copyAction]},
  {kind: 'char', id: 'emoji', name: 'Icon', emoji: true, default: '🚀', icon: icon('mood-smile')},
  {
    kind: 'str',
    id: 'notes',
    name: 'Notes',
    optional: true,
    default: 'Prefers async communication.',
    placeholder: 'Add notes…',
    icon: icon('note'),
  },
  {kind: 'str', id: 'owner', name: 'Owner', placeholder: 'Who owns this?', icon: icon('user-star')},
  {
    kind: 'str',
    id: 'website',
    name: 'Website',
    default: 'https://jsonjoy.com/specs',
    format: 'URL',
    validate: /^https?:\/\/\S+$/,
    icon: icon('link'),
  },
  {
    kind: 'str',
    id: 'uuid',
    name: 'ID',
    technical: true,
    default: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    icon: icon('hash'),
    actions: [copyAction],
  },
  {
    kind: 'select',
    id: 'stage',
    name: 'Stage',
    default: 'beta',
    readonly: true,
    icon: icon('rocket'),
    options: [
      {name: 'Alpha', id: 'alpha'},
      {name: 'Beta', id: 'beta', color: '#0091ff'},
      {name: 'GA', id: 'ga', color: '#30a46c'},
    ],
  },
  {
    kind: 'str',
    id: 'branch',
    name: 'Branch',
    technical: true,
    readonly: true,
    default: 'mutxt-polish',
    icon: icon('git-branch'),
  },
  {kind: 'num', id: 'points', name: 'Points', default: 13, unit: 'pt', readonly: true, icon: icon('sum')},
  {kind: 'num', id: 'size', name: 'Size', view: 'bytes', default: 348160, readonly: true, icon: icon('database')},
  {
    kind: 'num',
    id: 'progress',
    name: 'Progress',
    view: 'percent',
    default: 0.64,
    readonly: true,
    icon: icon('chart-donut'),
  },
  {
    kind: 'num',
    id: 'spent',
    name: 'Time spent',
    view: 'duration',
    default: 4980000,
    readonly: true,
    icon: icon('hourglass'),
  },
  {kind: 'bool', id: 'archived', name: 'Archived', default: false, readonly: true, icon: icon('archive')},
];

const item: MenuItem = {name: 'Task'};
const noop = () => {};

const sampleManage = (_param: Param): MenuItem[] => [
  {name: 'Rename', onSelect: () => {}},
  {name: 'Edit property type', onSelect: () => {}},
  {name: 'Duplicate', onSelect: () => {}},
  {name: 'Hide in view', onSelect: () => {}},
  {name: '', sep: true},
  {name: 'Delete property', danger: true, onSelect: () => {}},
];

const Frame: React.FC<{children: React.ReactNode; width?: number}> = ({children, width = 380}) => (
  <ContextPane style={{width, padding: '8px 0'}}>{children}</ContextPane>
);

export const Menu: StoryObj = {
  render: () => (
    <Frame width={320}>
      <FieldList inline variant="menu" floatActions item={item} params={params} onCancel={noop} />
    </Frame>
  ),
};

// Same context menu with an Apply footer: the button stays disabled while any
// field is invalid (Assignees starts below its `min` of 2).
export const MenuSubmit: StoryObj = {
  render: () => (
    <Frame width={320}>
      <FieldList
        inline
        variant="menu"
        floatActions
        item={item}
        params={params}
        onCancel={noop}
        onSubmit={(list) => console.log('submit', list)}
      />
    </Frame>
  ),
};

// Block variant: framed as a full-width page block — page icon, big title, a
// subtitle, then the fields section below (Notion page-properties feel).
const BlockPage: React.FC<{fill?: boolean; edit?: 'live' | 'reveal'}> = ({fill, edit = 'reveal'}) => {
  const styles = useStyles();
  return (
    <div
      style={{
        width: fill ? '100%' : 1000,
        maxWidth: fill ? 'none' : '92vw',
        boxSizing: 'border-box',
        background: styles.g(1),
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.07)',
        padding: '56px 72px',
      }}
    >
      <div style={{fontSize: 46, lineHeight: 1, marginBottom: 14}} aria-hidden>
        🚀
      </div>
      <h1 style={{margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', color: styles.g(0.05)}}>
        Project Atlas
      </h1>
      <p style={{margin: '12px 0 0', maxWidth: 640, fontSize: 16, lineHeight: 1.5, color: styles.g(0.45)}}>
        A cross-team initiative to unify the design system, component library, and documentation into a single source of
        truth.
      </p>
      <div style={{marginTop: 28, paddingTop: 8, borderTop: `1px solid ${styles.g(0, 0.07)}`, maxWidth: 600}}>
        <div style={{margin: '0 -16px'}}>
          <FieldList
            inline
            variant="block"
            edit={edit}
            manage={sampleManage}
            item={item}
            params={params}
            onCancel={noop}
            onAddField={() => console.log('add field')}
          />
        </div>
      </div>
    </div>
  );
};

export const Block: StoryObj = {render: () => <BlockPage />};

// Card variant: framed inside a real `<Card>` — identity header (type badge +
// id), heading (title + description), then the fields as the card body.
const TaskCard: React.FC<{edit?: 'live' | 'reveal'}> = ({edit}) => (
  <UiCard
    width={400}
    header={
      <CardHeader
        icon={<TypeBadge icon={<Iconista width={16} height={16} set="tabler" icon={'rocket' as never} />} />}
        eyebrow={<Eyebrow>Task</Eyebrow>}
        identifier="ENG-241"
        identifierCopyable
        menu={<BasicButtonMore />}
      />
    }
    title={<CardTitle title="Tune the card hover transition" subtitle="Spring should settle under 200ms" />}
    body={
      <div style={{margin: '0 -16px'}}>
        <FieldList
          inline
          variant="card"
          edit={edit}
          manage={sampleManage}
          item={item}
          params={params}
          onCancel={noop}
          onAddField={() => console.log('add field')}
        />
      </div>
    }
  />
);

export const Card: StoryObj = {render: () => <TaskCard />};

// All three density variants side by side for a direct comparison of the one
// `FieldList` under `block`, `card`, and `menu` presets.
// A labeled column that centers its content (so the fixed-width card and menu
// sit centered), while a full-width child like the block page fills the column.
const VariantColumn: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0}}>
    <div style={{fontSize: 12, opacity: 0.5, margin: '0 0 8px', fontFamily: 'monospace'}}>{label}</div>
    {children}
  </div>
);

export const All: StoryObj = {
  parameters: {layout: 'fullscreen'},
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 44fr) minmax(0, 28fr) minmax(0, 28fr)',
        gap: 40,
        alignItems: 'start',
        padding: 32,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <VariantColumn label='variant="block"'>
        <BlockPage fill />
        {/* Same block variant, but controls are immediately visible (no reveal). */}
        <div style={{fontSize: 12, opacity: 0.5, margin: '24px 0 8px', fontFamily: 'monospace'}}>
          variant="block" edit="live"
        </div>
        <BlockPage fill edit="live" />
      </VariantColumn>
      <VariantColumn label='variant="card"'>
        <TaskCard />
        {/* Same card variant, but controls are immediately visible (no reveal). */}
        <div style={{fontSize: 12, opacity: 0.5, margin: '24px 0 8px', fontFamily: 'monospace'}}>
          variant="card" edit="live"
        </div>
        <TaskCard edit="live" />
      </VariantColumn>
      <VariantColumn label='variant="menu"'>
        <Frame width={320}>
          <FieldList inline variant="menu" floatActions item={item} params={params} onCancel={noop} />
        </Frame>
        {/* A second context menu below, right-aligned but with reveal controls:
            values show read-only and open their editor on click. Actions float
            over the right edge so the value column keeps its full width. */}
        <div style={{fontSize: 12, opacity: 0.5, margin: '24px 0 8px', fontFamily: 'monospace'}}>
          variant="menu" edit="reveal"
        </div>
        <Frame width={320}>
          <FieldList inline variant="menu" edit="reveal" floatActions item={item} params={params} onCancel={noop} />
        </Frame>
      </VariantColumn>
    </div>
  ),
};
