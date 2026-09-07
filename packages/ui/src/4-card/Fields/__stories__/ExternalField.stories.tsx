import * as React from 'react';
import {FieldList} from '../index';
import {ExternalFieldRegistryProvider, type ExternalFieldRenderer} from '../external';
import {ContextPane} from '../../ContextMenu/ContextPane';
import {Popup} from '../../Popup';
import {usePopup} from '../../Popup/context';
import {Iconista} from '../../../icons/Iconista';
import {useStyles} from '../../../styles/context';
import type {MenuItem, Param} from '../../StructuralMenu/types';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/Fields/ExternalField',
  parameters: {layout: 'centered'},
};

export default meta;

const icon = (name: string) => () => <Iconista width={15} height={15} set="tabler" icon={name as never} />;
const ico = (name: string, size = 15) => <Iconista width={size} height={size} set="tabler" icon={name as never} />;

const PEOPLE = ['Jane Doe', 'Alex Kim', 'Sam Rivera', 'Priya Patel', 'Chris Ng'];

const Avatar: React.FC<{name: string}> = ({name}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: `hsl(${hue} 55% 52%)`,
        color: '#fff',
        fontSize: 9,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
      }}
    >
      {initials}
    </span>
  );
};

const PersonChip: React.FC<{name?: string}> = ({name}) =>
  name ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <Avatar name={name} />
      <span>{name}</span>
    </span>
  ) : (
    <span style={{opacity: 0.5}}>Pick person</span>
  );

const PeopleList: React.FC<{value?: string; onPick: (name: string) => void}> = ({value, onPick}) => {
  const styles = useStyles();
  return (
    <div style={{minWidth: 200, padding: 6}}>
      {PEOPLE.map((name) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: demo list
        <div
          key={name}
          onClick={() => onPick(name)}
          onMouseEnter={(e) => (e.currentTarget.style.background = styles.g(0, 0.06))}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 8px',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          <Avatar name={name} />
          <span style={{flex: 1}}>{name}</span>
          {value === name && <span style={{color: styles.g(0.25), display: 'inline-flex'}}>{ico('check', 14)}</span>}
        </div>
      ))}
    </div>
  );
};

const PersonMenu: React.FC<{value?: string; onChange: (v: unknown) => void}> = ({value, onChange}) => {
  const popup = usePopup();
  return (
    <PeopleList
      value={value}
      onPick={(name) => {
        onChange(name);
        popup?.close?.();
      }}
    />
  );
};

const personRenderer: ExternalFieldRenderer = {
  isEmpty: (v) => !v,
  view: ({value}) => <PersonChip name={value ? String(value) : undefined} />,
  control: ({value, onChange}) => (
    <Popup renderContext={() => <PersonMenu value={value as string} onChange={onChange} />}>
      <span style={{cursor: 'pointer', display: 'inline-flex'}}>
        <PersonChip name={value ? String(value) : undefined} />
      </span>
    </Popup>
  ),
  editor: ({value, onChange, onCommit}) => (
    <PeopleList
      value={value as string}
      onPick={(name) => {
        onChange(name);
        onCommit();
      }}
    />
  ),
};

// --- A "rating" external field: a 0..5 number shown as stars. Demonstrates a
// renderer with no `editor` (the reveal popover falls back to `control`). -----
const Stars: React.FC<{value: number; onChange?: (v: number) => void}> = ({value, onChange}) => {
  const styles = useStyles();
  return (
    <span style={{display: 'inline-flex', gap: 1}}>
      {[1, 2, 3, 4, 5].map((i) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: demo control
        <span
          key={i}
          onClick={
            onChange
              ? (e) => {
                  e.stopPropagation();
                  onChange(i === value ? i - 1 : i);
                }
              : undefined
          }
          style={{
            cursor: onChange ? 'pointer' : 'default',
            color: i <= value ? '#f5a623' : styles.g(0.8),
            display: 'inline-flex',
          }}
        >
          {ico('star', 16)}
        </span>
      ))}
    </span>
  );
};

const ratingRenderer: ExternalFieldRenderer = {
  isEmpty: (v) => v === undefined || v === null,
  view: ({value}) => <Stars value={Number(value) || 0} />,
  control: ({value, onChange}) => <Stars value={Number(value) || 0} onChange={(v) => onChange(v)} />,
};

const ALL_TAGS = ['bug', 'feature', 'urgent', 'design', 'backend', 'docs'];

const TagPills: React.FC<{tags: string[]}> = ({tags}) => {
  const styles = useStyles();
  if (!tags.length) return <span style={{opacity: 0.5}}>Add tags</span>;
  return (
    <span style={{display: 'inline-flex', flexWrap: 'wrap', gap: 4}}>
      {tags.map((t) => (
        <span
          key={t}
          style={{
            background: styles.g(0, 0.07),
            color: styles.g(0.2),
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 12,
          }}
        >
          {t}
        </span>
      ))}
    </span>
  );
};

const TagEditor: React.FC<{value: string[]; onChange: (v: unknown) => void}> = ({value, onChange}) => {
  const styles = useStyles();
  const toggle = (t: string) => onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  return (
    <div style={{minWidth: 220, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6}}>
      {ALL_TAGS.map((t) => {
        const on = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            style={{
              border: 0,
              cursor: 'pointer',
              borderRadius: 4,
              padding: '3px 9px',
              fontSize: 12,
              background: on ? '#3b82f6' : styles.g(0, 0.07),
              color: on ? '#fff' : styles.g(0.2),
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
};

const asTags = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

const tagsRenderer: ExternalFieldRenderer = {
  isEmpty: (v) => asTags(v).length === 0,
  view: ({value}) => <TagPills tags={asTags(value)} />,
  control: ({value, onChange}) => (
    <Popup renderContext={() => <TagEditor value={asTags(value)} onChange={onChange} />}>
      <span style={{cursor: 'pointer', display: 'inline-flex'}}>
        <TagPills tags={asTags(value)} />
      </span>
    </Popup>
  ),
  editor: ({value, onChange}) => <TagEditor value={asTags(value)} onChange={onChange} />,
};

const registry: Record<string, ExternalFieldRenderer> = {
  person: personRenderer,
  rating: ratingRenderer,
  tags: tagsRenderer,
};

const params: (Param | MenuItem)[] = [
  {kind: 'str', id: 'title', name: 'Title', default: 'Ship v2', icon: icon('forms')},
  {
    kind: 'external',
    id: 'owner',
    name: 'Owner',
    external: 'person',
    default: 'Jane Doe',
    icon: icon('user'),
    // Actions specified on the descriptor itself (shown even without the
    // FieldList `actions` override, e.g. in the Menu story).
    actions: [{name: 'Comment', icon: () => ico('message', 16), onSelect: () => console.log('comment owner')}],
  },
  {kind: 'external', id: 'rating', name: 'Rating', external: 'rating', default: 4, icon: icon('star')},
  {kind: 'external', id: 'tags', name: 'Tags', external: 'tags', default: ['design', 'urgent'], icon: icon('hash')},
  {kind: 'num', id: 'estimate', name: 'Estimate', default: 5, icon: icon('clock')},
];

const item: MenuItem = {name: 'Task'};
const noop = () => {};

const manage = (): MenuItem[] => [
  {name: 'Edit property', onSelect: () => {}},
  {name: '', sep: true},
  {name: 'Delete', danger: true, onSelect: () => {}},
];

const actions = (): MenuItem[] => [
  {name: 'Comment', icon: () => ico('message', 16), onSelect: () => console.log('comment')},
  {name: 'Copy', icon: () => ico('copy', 16), onSelect: () => console.log('copy')},
];

const Frame: React.FC<{children: React.ReactNode; label?: string; width?: number}> = ({
  children,
  label,
  width = 380,
}) => (
  <div style={{margin: 16}}>
    {label && <div style={{fontSize: 12, opacity: 0.5, margin: '0 0 6px 8px', fontFamily: 'monospace'}}>{label}</div>}
    <ExternalFieldRegistryProvider registry={registry}>
      <ContextPane style={{width, padding: '8px 0'}}>{children}</ContextPane>
    </ExternalFieldRegistryProvider>
  </div>
);

// Context-menu mode: external fields render their inline `control`.
export const Menu: StoryObj = {
  render: () => (
    <Frame label="menu (live) — inline external controls" width={340}>
      <FieldList inline variant="menu" item={item} params={params} onCancel={noop} />
    </Frame>
  ),
};

// Card mode: external fields render a `view` chip, click reveals the `editor`
// (or `control`) in the popover. Row hover shows the action buttons.
export const Card: StoryObj = {
  render: () => (
    <Frame label="card (reveal) — chip + reveal editor, hover for actions" width={360}>
      <FieldList
        inline
        variant="card"
        rowHover
        manage={manage}
        actions={actions}
        item={item}
        params={params}
        onCancel={noop}
      />
    </Frame>
  ),
};

// Block mode: roomier, left-aligned, with actions.
export const Block: StoryObj = {
  render: () => (
    <Frame label="block (reveal) — roomy, hover for actions" width={420}>
      <FieldList
        inline
        variant="block"
        edit="reveal"
        rowHover
        manage={manage}
        actions={actions}
        item={item}
        params={params}
        onCancel={noop}
      />
    </Frame>
  ),
};

// An external field with no registered renderer degrades to a read-only value
// (what happens in a host with no Things runtime, e.g. peritext / mutxt).
export const Unregistered: StoryObj = {
  render: () => (
    <div style={{margin: 16}}>
      <div style={{fontSize: 12, opacity: 0.5, margin: '0 0 6px 8px', fontFamily: 'monospace'}}>
        no registry — external fields fall back to read-only
      </div>
      <ContextPane style={{width: 340, padding: '8px 0'}}>
        <FieldList inline variant="menu" item={item} params={params} onCancel={noop} />
      </ContextPane>
    </div>
  ),
};
