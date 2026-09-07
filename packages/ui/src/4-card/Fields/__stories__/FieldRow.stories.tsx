import * as React from 'react';
import {FieldRow} from '../FieldRow';
import {FieldControl} from '../FieldControl';
import {ContextPane} from '../../ContextMenu/ContextPane';
import {Iconista} from '../../../icons/Iconista';
import type {MenuItem, Param} from '../../StructuralMenu/types';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/Fields/FieldRow',
  parameters: {layout: 'centered'},
};

export default meta;

const icon = (name: string) => <Iconista width={15} height={15} set="tabler" icon={name as never} />;

const params: Param[] = [
  {kind: 'str', id: 'title', name: 'Title', placeholder: 'Title…'},
  {kind: 'num', id: 'count', name: 'Count'},
  {kind: 'bool', id: 'done', name: 'Done'},
  {
    kind: 'select',
    id: 'priority',
    name: 'Priority',
    options: [
      {name: 'Low', id: 'p0'},
      {name: 'High', id: 'p1'},
      {name: 'Urgent', id: 'p2'},
    ],
  },
  {kind: 'color', id: 'color', name: 'Color'},
];

const icons: Record<string, string> = {
  title: 'forms',
  count: 'hash',
  done: 'checkbox',
  priority: 'flag',
  color: 'palette',
};

const manageItems = (): MenuItem[] => [
  {name: 'Rename', onSelect: () => console.log('rename')},
  {name: 'Edit type', onSelect: () => console.log('edit type')},
  {name: 'Hide', onSelect: () => console.log('hide')},
  {name: 'Duplicate', onSelect: () => console.log('duplicate')},
  {name: '', sep: true},
  {name: 'Delete', danger: true, onSelect: () => console.log('delete')},
];

interface DemoProps {
  align?: 'left' | 'right';
  spacing?: number;
  manage?: boolean;
}

const Demo: React.FC<DemoProps> = ({align, spacing, manage}) => {
  const [vals, setVals] = React.useState<Record<string, unknown>>({
    title: 'Ship v2',
    count: 3,
    done: true,
    priority: 'p1',
    color: '#0077ff',
  });
  const set = (k: string, v: unknown) => setVals((s) => ({...s, [k]: v}));

  return (
    <ContextPane style={{width: 360, padding: '8px 0'}}>
      {params.map((p) => {
        const id = p.id ?? p.name;
        return (
          <FieldRow
            key={id}
            icon={icon(icons[id])}
            title={p.name}
            align={align}
            spacing={spacing}
            manage={manage ? manageItems : undefined}
          >
            <FieldControl param={p} value={vals[id]} onChange={(v) => set(id, v)} onSubmit={() => {}} />
          </FieldRow>
        );
      })}
    </ContextPane>
  );
};

export const RightAligned: StoryObj = {render: () => <Demo align="right" />};
export const LeftAligned: StoryObj = {render: () => <Demo align="left" />};
export const Roomy: StoryObj = {render: () => <Demo align="left" spacing={0.95} />};
export const Tight: StoryObj = {render: () => <Demo align="left" spacing={0.1} />};
export const WithManageMenu: StoryObj = {render: () => <Demo align="left" manage />};
