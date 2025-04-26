import * as React from 'react';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {CaretBottomState} from './state';
import {FormattingList} from './FormattingList';
import {FormattingDisplay} from './FormattingDisplay';
import {useToolbarPlugin} from '../../context';
import type {Inline} from '../../../../../json-crdt-extensions';

export interface ManageFormattingsCardProps {
  inline: Inline;
}

export const ManageFormattingsCard: React.FC<ManageFormattingsCardProps> = ({inline}) => {
  const {toolbar} = useToolbarPlugin();
  const state = React.useMemo(() => new CaretBottomState(toolbar, inline), [toolbar, inline?.key()]);
  const formattings = useBehaviorSubject(React.useMemo(() => state.getFormattings$(), [state]));
  const selected = useBehaviorSubject(state.selected$);

  if (selected || formattings.length === 1) {
    return (<FormattingDisplay formatting={selected || formattings[0]} onClose={!selected ? void 0 : () => state.select(null)} />);
  }

  if (!formattings.length) return null;

  return <FormattingList formattings={formattings} onSelect={state.select} />;
};
