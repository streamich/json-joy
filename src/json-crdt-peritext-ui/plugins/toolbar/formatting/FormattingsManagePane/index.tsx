import * as React from 'react';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {FormattingManageState} from './state';
import {FormattingList} from './FormattingList';
import {FormattingDisplay} from './FormattingDisplay';
import {useToolbarPlugin} from '../../context';
import {context} from './context';
import type {Inline} from '../../../../../json-crdt-extensions';

export interface FormattingsManagePaneProps {
  inline: Inline;
}

export const FormattingsManagePane: React.FC<FormattingsManagePaneProps> = ({inline}) => {
  const {toolbar} = useToolbarPlugin();
  // biome-ignore lint: too many dependencies
  const state = React.useMemo(() => new FormattingManageState(toolbar, inline), [toolbar, inline?.key()]);
  const formattings = useBehaviorSubject(React.useMemo(() => state.getFormattings$(), [state]));
  const selected = useBehaviorSubject(state.selected$);

  if (selected || formattings.length === 1) {
    return (
      <context.Provider value={state}>
        <FormattingDisplay
          formatting={selected || formattings[0]}
          onClose={!selected ? void 0 : () => state.select(null)}
        />
      </context.Provider>
    );
  }

  if (!formattings.length) return null;

  return (
    <context.Provider value={state}>
      <FormattingList formattings={formattings} onSelect={state.select} />
    </context.Provider>
  );
};
