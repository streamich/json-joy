import * as React from 'react';
import {ValueCell} from '../ValueCell';
import {FieldRow} from '../FieldRow';
import {currentSource, ValueSource} from '../ValueSource';
import {ContextPane} from '../../ContextMenu/ContextPane';
import {Iconista} from '../../../icons/Iconista';
import type {MenuItem, ParamSelect, ParamStr, ParamColor} from '../../StructuralMenu/types';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/Fields/ValueCell',
  parameters: {layout: 'centered'},
};

export default meta;

const ico = (name: string) => <Iconista width={15} height={15} set="tabler" icon={name as never} />;

const computedSource = (value: unknown, origin?: string): ValueSource => ({
  reason: 'computed',
  values: [{value, meta: {reason: 'computed', origin}}],
});

const defaultSource = (value: unknown, origin?: string): ValueSource => ({
  reason: 'default',
  values: [{value, meta: {reason: 'default', origin}}],
});

const Pane: React.FC<{children: React.ReactNode; label?: string; width?: number}> = ({
  children,
  label,
  width = 380,
}) => (
  <div style={{margin: 16}}>
    {label && <div style={{fontSize: 12, opacity: 0.5, margin: '0 0 6px 8px', fontFamily: 'monospace'}}>{label}</div>}
    <ContextPane style={{width, padding: '8px 0'}}>{children}</ContextPane>
  </div>
);

// Select with the rich reveal editor. Options are owned by the story so create /
// reorder / delete persist across opens (controlled mode).
const SelectDemo: React.FC = () => {
  const [options, setOptions] = React.useState<MenuItem[]>([
    {name: 'Todo', id: 'todo', color: '#9aa0a6'},
    {name: 'In progress', id: 'doing', color: '#0b87f7'},
    {name: 'In review', id: 'review', color: '#a259ff'},
    {name: 'Done', id: 'done', color: '#1aa463'},
    {name: 'Archived', id: 'archived', color: '#9aa0a6'},
    {name: 'Blocked', id: 'blocked', color: '#e5484d'},
  ]);
  const [value, setValue] = React.useState('doing');
  const param: ParamSelect = {kind: 'select', id: 'status', name: 'Status', options};
  return (
    <Pane label="select — click the value to search / create / reorder">
      <FieldRow
        icon={ico('flag')}
        title="Status"
        align="left"
        manage={() => [{name: 'Edit property', onSelect: () => {}}]}
      >
        <ValueCell
          param={param}
          value={value}
          align="left"
          onChange={(v) => setValue(typeof v === 'string' ? v : String((v as {value?: unknown}).value ?? ''))}
          onOptionsChange={setOptions}
        />
      </FieldRow>
    </Pane>
  );
};

export const SelectReveal: StoryObj = {render: () => <SelectDemo />};

// Text / color use the generic editor (the inline control auto-focused, Enter
// commits + closes).
const ScalarDemo: React.FC = () => {
  const [title, setTitle] = React.useState('Ship v2');
  const [color, setColor] = React.useState('#0077ff');
  const titleParam: ParamStr = {kind: 'str', id: 'title', name: 'Title', placeholder: 'Title…'};
  const colorParam: ParamColor = {kind: 'color', id: 'color', name: 'Color'};
  return (
    <Pane label="text + color — click to reveal the inline editor">
      <FieldRow icon={ico('forms')} title="Title" align="left">
        <ValueCell param={titleParam} value={title} align="left" onChange={(v) => setTitle(String(v ?? ''))} />
      </FieldRow>
      <FieldRow icon={ico('palette')} title="Color" align="left">
        <ValueCell param={colorParam} value={color} align="left" onChange={(v) => setColor(String(v ?? ''))} />
      </FieldRow>
    </Pane>
  );
};

export const ScalarReveal: StoryObj = {render: () => <ScalarDemo />};

// Provenance: the same select rendered from three ValueSource reasons.
const ProvenanceDemo: React.FC = () => {
  const options: MenuItem[] = [
    {name: 'Low', id: 'low', color: '#9aa0a6'},
    {name: 'High', id: 'high', color: '#f5a623'},
    {name: 'Urgent', id: 'urgent', color: '#e5484d'},
  ];
  const param: ParamSelect = {kind: 'select', id: 'priority', name: 'Priority', options};
  const [value, setValue] = React.useState('high');
  const onChange = (v: unknown) => setValue(typeof v === 'string' ? v : String((v as {value?: unknown}).value ?? ''));
  return (
    <Pane label="provenance — current (editable) · default (muted) · computed (ƒ, read-only)" width={420}>
      <FieldRow icon={ico('flag')} title="Current" align="left">
        <ValueCell param={param} source={currentSource(value)} align="left" onChange={onChange} />
      </FieldRow>
      <FieldRow icon={ico('flag')} title="Default" align="left">
        <ValueCell
          param={param}
          source={defaultSource('low', 'Inherited from Project')}
          align="left"
          onChange={onChange}
        />
      </FieldRow>
      <FieldRow icon={ico('flag')} title="Computed" align="left">
        <ValueCell
          param={param}
          source={computedSource('urgent', 'max(subtasks.priority)')}
          align="left"
          onChange={onChange}
        />
      </FieldRow>
    </Pane>
  );
};

export const Provenance: StoryObj = {render: () => <ProvenanceDemo />};
