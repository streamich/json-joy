import * as React from 'react';
import {Char} from '../../constants';
import {usePeritext} from '../context';
import {useCaret} from './hooks';

export interface FocusViewProps {
  left?: boolean;
}

export const FocusView: React.FC<FocusViewProps> = (props) => {
  const {dom, renderers} = usePeritext();
  const ref = useCaret();

  let children: React.ReactNode = (
    <span id={dom?.selection.caretId} ref={ref}>
      {Char.ZeroLengthSpace}
    </span>
  );

  for (const map of renderers) children = map.focus?.(children, props);

  return children;
};
