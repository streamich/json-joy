import * as React from 'react';
import {Char} from '../../constants';
import {usePeritext} from '../context';
import {useCaret} from './hooks';

export const Caret: React.FC = () => {
  const {dom} = usePeritext();
  const ref = useCaret();

  return (
    <span id={dom.cursor.caretId} ref={ref}>
      {Char.ZeroLengthSpace}
    </span>
  );
};
