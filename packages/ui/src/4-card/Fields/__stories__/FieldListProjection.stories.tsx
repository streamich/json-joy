import * as React from 'react';
import {FieldList} from '../index';
import {ContextPane} from '../../ContextMenu/ContextPane';
import {Iconista} from '../../../icons/Iconista';
import type {MenuItem, Param} from '../../StructuralMenu/types';
import type {ViewProjection} from '../../../types/ViewProjection';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta = {
  title: '4. Card/Fields/Projection',
  parameters: {layout: 'centered'},
};

export default meta;

const icon = (name: string) => () => <Iconista width={15} height={15} set="tabler" icon={name as never} />;

const params: (Param | MenuItem)[] = [
  {kind: 'str', id: 'title', name: 'Title', default: 'Ship v2', icon: icon('forms')},
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
  },
  {kind: 'bool', id: 'pinned', name: 'Pinned', default: true, icon: icon('pin')},
  {kind: 'num', id: 'estimate', name: 'Estimate', default: 5, icon: icon('clock')},
  {kind: 'color', id: 'color', name: 'Color', default: '#0077ff', icon: icon('palette')},
];

const item: MenuItem = {name: 'Task'};
const noop = () => {};
const manage = (): MenuItem[] => [
  {name: 'Rename', onSelect: () => {}},
  {name: 'Edit type', onSelect: () => {}},
  {name: '', sep: true},
  {name: 'Delete', danger: true, onSelect: () => {}},
];

// One projection drives variant/edit/spacing/detail/align — the same `params`
// render as a compact menu, a card, or a block just by changing the projection.
const Pane: React.FC<{label: string; projection: ViewProjection; width?: number}> = ({
  label,
  projection,
  width = 360,
}) => (
  <div style={{display: 'inline-block', verticalAlign: 'top', margin: 8}}>
    <div style={{fontSize: 12, opacity: 0.5, margin: '0 0 6px 8px', fontFamily: 'monospace'}}>{label}</div>
    <ContextPane style={{width, padding: '8px 0'}}>
      <FieldList inline projection={projection} manage={manage} item={item} params={params} onCancel={noop} />
    </ContextPane>
  </div>
);

export const StanceView: StoryObj = {
  render: () => <Pane label="{stance:'view'}" projection={{stance: 'view'}} />,
};

export const EditCard: StoryObj = {
  render: () => <Pane label="{stance:'edit', view:'card'}" projection={{stance: 'edit', view: 'card'}} />,
};

export const EditBlock: StoryObj = {
  render: () => <Pane label="{stance:'edit', view:'block'}" projection={{stance: 'edit', view: 'block'}} width={420} />,
};

export const Roomy: StoryObj = {
  render: () => (
    <Pane
      label="{view:'block', spacing:0.95, detail:0.9}"
      projection={{view: 'block', spacing: 0.95, detail: 0.9}}
      width={420}
    />
  ),
};

export const OneVocabularyThreeSurfaces: StoryObj = {
  render: () => (
    <div>
      <Pane label="{} → menu" projection={{}} width={300} />
      <Pane label="{view:'card', stance:'edit'}" projection={{view: 'card', stance: 'edit'}} width={340} />
      <Pane label="{view:'block', stance:'view'}" projection={{view: 'block', stance: 'view'}} width={380} />
    </div>
  ),
};
