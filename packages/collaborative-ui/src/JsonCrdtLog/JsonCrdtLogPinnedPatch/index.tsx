import * as React from 'react';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useLogState} from '../context';
import {JsonCrdtPatch} from '../../JsonCrdtPatch';
import {Patch} from 'json-joy/lib/json-crdt';
import {theme} from 'nano-theme';

const colors = theme.color.color;
const colorCount = colors.length;

export interface JsonCrdtLogPinnedPatchProps {
  filename?: string;
}

export const JsonCrdtLogPinnedPatch: React.FC<JsonCrdtLogPinnedPatchProps> = ({filename}) => {
  const state = useLogState();
  const patch = useBehaviorSubject(state.pinned$);

  if (!(patch instanceof Patch)) return null;

  const sid = patch.getId()?.sid ?? 0;
  const color = colors[sid % colorCount];

  return <JsonCrdtPatch state={state.patchState} pinned={color} patch={patch} filename={filename} />;
};
