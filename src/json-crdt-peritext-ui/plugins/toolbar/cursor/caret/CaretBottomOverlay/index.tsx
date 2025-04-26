import * as React from 'react';
import {useToolbarPlugin} from '../../../context';
import {CaretBottomState} from './state';
import {FormattingList} from './FormattingList';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {FormattingDisplay} from './FormattingDisplay';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;
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
