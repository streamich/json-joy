import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {Avatar} from '../../../1-inline/Avatar';
import {AvatarStack} from '../../../1-inline/AvatarStack';
import {Eyebrow} from '../../../1-inline/Eyebrow';
import {Num} from '../../../1-inline/Num';
import {TypeBadge} from '../../../1-inline/TypeBadge';
import {useSpacingTrace} from '../../../context/traces';
import {Iconista} from '../../../icons/Iconista';
import {useStyles} from '../../../styles/context';
import {CardHeader, CardTitle, Card as UiCard} from '../../Card';
import {ContextPane} from '../../ContextMenu/ContextPane';
import type {MenuItem, Param} from '../../StructuralMenu/types';
import {ExternalFieldRegistryProvider, type ExternalFieldRenderer} from '../external';
import {FieldList} from '../index';

const meta: Meta = {
  title: '4. Card/Fields/ReadOnly',
  parameters: {layout: 'centered'},
};

export default meta;

const icon = (name: string) => () => <Iconista width={15} height={15} set="tabler" icon={name as never} />;
const noop = () => {};

// ------------------------------------------------------- External renderer
// Person fields are the canonical `external` field: the ui package stays
// entity-free and the host (e.g. Things UI) registers a renderer. This demo
// registry shows the wiring — avatar + name for one person, stack + count
// for many.

interface DemoUser {
  name: string;
  id?: string;
}

const Users: React.FC<{value: unknown}> = ({value}) => {
  const spacing = useSpacingTrace(0.5);
  const users = (Array.isArray(value) ? value : value ? [value] : []) as DemoUser[];
  const width = Math.round(16 + spacing * 6);
  const avatar = (u: DemoUser, key: React.Key) => (
    <Avatar key={key} width={width} name={u.name} id={u.id ?? u.name} noHover />
  );
  if (users.length === 1)
    return (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0}}>
        {avatar(users[0], 0)}
        <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {users[0].name}
        </span>
      </span>
    );
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}} title={users.map((u) => u.name).join(', ')}>
      <AvatarStack gap={-6} noHoverEffect>
        {users.slice(0, 5).map(avatar)}
      </AvatarStack>
      <Num value={users.length} />
    </span>
  );
};

const userRenderer: ExternalFieldRenderer = {
  view: ({value}) => <Users value={value} />,
  control: ({value}) => <Users value={value} />,
  isEmpty: (value) => value == null || (Array.isArray(value) && !value.length),
};

const registry = {user: userRenderer};

// ---------------------------------------------------------- File inspector
// Every row read-only: technical voices (paths, hashes, permissions), bytes,
// dates, and a person — the Finder/inspector "get info" panel shape.

const fileItem: MenuItem = {name: 'File'};

const fileParams: (Param | MenuItem)[] = [
  {kind: 'str', id: 'name', name: 'Name', readonly: true, default: 'quarterly-report.pdf', icon: icon('file')},
  {
    kind: 'str',
    id: 'path',
    name: 'Path',
    technical: true,
    readonly: true,
    default: '/home/vadim/docs/reports/quarterly-report.pdf',
    icon: icon('folder'),
  },
  {kind: 'num', id: 'size', name: 'Size', view: 'bytes', readonly: true, default: 2372812, icon: icon('database')},
  {
    kind: 'str',
    id: 'mime',
    name: 'Type',
    technical: true,
    readonly: true,
    default: 'application/pdf',
    icon: icon('file-info'),
  },
  {kind: 'date', id: 'created', name: 'Created', readonly: true, default: '2026-03-14', icon: icon('calendar-plus')},
  {
    kind: 'date',
    id: 'modified',
    name: 'Modified',
    time: true,
    relative: true,
    readonly: true,
    default: '2026-07-08T11:20',
    icon: icon('history'),
  },
  {
    kind: 'str',
    id: 'sha',
    name: 'SHA-256',
    technical: true,
    readonly: true,
    default: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    icon: icon('hash'),
  },
  {
    kind: 'str',
    id: 'perms',
    name: 'Permissions',
    technical: true,
    readonly: true,
    default: 'rw-r--r--',
    icon: icon('lock'),
  },
  {
    kind: 'external',
    external: 'user',
    id: 'owner',
    name: 'Owner',
    readonly: true,
    default: {name: 'Vadims Daleckis', id: 'streamich'},
    icon: icon('user'),
  },
];

export const FileCard: StoryObj = {
  render: () => (
    <ExternalFieldRegistryProvider registry={registry}>
      <UiCard
        width={420}
        header={
          <CardHeader
            icon={<TypeBadge icon={<Iconista width={16} height={16} set="tabler" icon={'file-text' as never} />} />}
            eyebrow={<Eyebrow>File</Eyebrow>}
            identifier="REP-2026-Q2"
            identifierCopyable
          />
        }
        title={<CardTitle title="quarterly-report.pdf" subtitle="Uploaded from the reports pipeline" />}
        body={
          <div style={{margin: '0 -16px'}}>
            <FieldList inline variant="card" item={fileItem} params={fileParams} onCancel={noop} />
          </div>
        }
      />
    </ExternalFieldRegistryProvider>
  ),
};

export const FileMenu: StoryObj = {
  render: () => (
    <ExternalFieldRegistryProvider registry={registry}>
      <ContextPane style={{width: 340, padding: '8px 0'}}>
        <FieldList inline variant="menu" item={fileItem} params={fileParams} onCancel={noop} />
      </ContextPane>
    </ExternalFieldRegistryProvider>
  ),
};

// ------------------------------------------------------------- Task audit
// Provenance and derived metrics of a task: people, relative times, progress
// donut, duration, and read-only selects with colored options.

const taskItem: MenuItem = {name: 'Task'};

const auditParams: (Param | MenuItem)[] = [
  {
    kind: 'external',
    external: 'user',
    id: 'author',
    name: 'Created by',
    readonly: true,
    default: {name: 'Alice Johnson', id: 'alice'},
    icon: icon('user'),
  },
  {
    kind: 'external',
    external: 'user',
    id: 'participants',
    name: 'Participants',
    readonly: true,
    default: [
      {name: 'Alice Johnson', id: 'alice'},
      {name: 'Bob Smith', id: 'bob'},
      {name: 'Carol White', id: 'carol'},
      {name: 'Dave Black', id: 'dave'},
    ],
    icon: icon('users-group'),
  },
  {kind: 'date', id: 'created', name: 'Created', readonly: true, default: '2026-06-02', icon: icon('calendar-plus')},
  {
    kind: 'date',
    id: 'updated',
    name: 'Updated',
    time: true,
    relative: true,
    readonly: true,
    default: '2026-07-09T08:12',
    icon: icon('history'),
  },
  {
    kind: 'num',
    id: 'progress',
    name: 'Progress',
    view: 'percent',
    readonly: true,
    default: 0.35,
    icon: icon('chart-donut'),
  },
  {
    kind: 'num',
    id: 'spent',
    name: 'Time spent',
    view: 'duration',
    readonly: true,
    default: 12780000,
    icon: icon('hourglass'),
  },
  {
    kind: 'select',
    id: 'status',
    name: 'Status',
    readonly: true,
    default: 'inprogress',
    icon: icon('flag'),
    options: [
      {name: 'Backlog', id: 'backlog'},
      {name: 'In progress', id: 'inprogress', color: '#0091ff'},
      {name: 'Done', id: 'done', color: '#30a46c'},
    ],
  },
  {
    kind: 'select',
    id: 'priority',
    name: 'Priority',
    readonly: true,
    default: 'high',
    icon: icon('flame'),
    options: [
      {name: 'Low', id: 'low'},
      {name: 'Medium', id: 'medium', color: '#f76b15'},
      {name: 'High', id: 'high', color: '#e5484d'},
    ],
  },
  {kind: 'num', id: 'comments', name: 'Comments', readonly: true, default: 27, icon: icon('message')},
];

const Panel: React.FC<{children: React.ReactNode; width?: number}> = ({children, width = 560}) => {
  const styles = useStyles();
  return (
    <div
      style={{
        width,
        maxWidth: '92vw',
        boxSizing: 'border-box',
        background: styles.g(1),
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.07)',
        padding: '32px 40px',
      }}
    >
      <div style={{margin: '0 -16px'}}>{children}</div>
    </div>
  );
};

export const TaskAudit: StoryObj = {
  render: () => (
    <ExternalFieldRegistryProvider registry={registry}>
      <Panel>
        <FieldList inline variant="block" edit="reveal" item={taskItem} params={auditParams} onCancel={noop} />
      </Panel>
    </ExternalFieldRegistryProvider>
  ),
};

// ------------------------------------------------------------- Mixed list
// Editable and read-only rows interleaved — checks that both share one
// vertical rhythm and value-column alignment.

const mixedParams: (Param | MenuItem)[] = [
  {kind: 'str', id: 'title', name: 'Title', default: 'Ship the fields suite', icon: icon('forms')},
  {
    kind: 'select',
    id: 'status',
    name: 'Status',
    default: 'doing',
    icon: icon('flag'),
    options: [
      {name: 'Todo', id: 'todo'},
      {name: 'Doing', id: 'doing', color: '#0091ff'},
      {name: 'Done', id: 'done', color: '#30a46c'},
    ],
  },
  {kind: 'num', id: 'estimate', name: 'Estimate', default: 12, min: 0, max: 40, unit: 'h', icon: icon('clock')},
  {
    kind: 'external',
    external: 'user',
    id: 'author',
    name: 'Created by',
    readonly: true,
    default: {name: 'Alice Johnson', id: 'alice'},
    icon: icon('user'),
  },
  {
    kind: 'date',
    id: 'updated',
    name: 'Updated',
    time: true,
    relative: true,
    readonly: true,
    default: '2026-07-09T08:12',
    icon: icon('history'),
  },
  {kind: 'num', id: 'size', name: 'Size', view: 'bytes', readonly: true, default: 348160, icon: icon('database')},
];

export const Mixed: StoryObj = {
  render: () => (
    <ExternalFieldRegistryProvider registry={registry}>
      <Panel>
        <FieldList inline variant="block" edit="reveal" item={taskItem} params={mixedParams} onCancel={noop} />
      </Panel>
    </ExternalFieldRegistryProvider>
  ),
};
