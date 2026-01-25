import * as React from 'react';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
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
  // biome-ignore lint: manually manage dependencies
  React.useLayoutEffect(() => {
    if (formattings.length === 1) {
      state.select(formattings[0]);
    }
  }, [formattings]);
  const selected = useBehaviorSubject(state.selected$);

  if (!formattings.length) return null;

  if (selected || formattings.length === 1) {
    return (
      <context.Provider value={state}>
        <FormattingDisplay
          formatting={selected || formattings[0]}
          onClose={!selected || formattings.length === 1 ? void 0 : () => state.select(null)}
        />
      </context.Provider>
    );
  }

  return (
    <context.Provider value={state}>
      <FormattingList formattings={formattings} onSelect={state.select} />
    </context.Provider>
  );
};
