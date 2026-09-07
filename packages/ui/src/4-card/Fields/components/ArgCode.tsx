import * as React from 'react';
import {CopyCode} from '../../../1-inline/CopyCode';
import type {ParamCode} from '../../StructuralMenu/types';

export interface ArgCodeProps {
  param: ParamCode;
}

/**
 * Value-only read-only code / id display with a copy-to-clipboard button. The
 * definition cell (label) is rendered by `FieldRow`.
 */
export const ArgCode: React.FC<ArgCodeProps> = ({param}) => {
  const truncate = param.truncate ?? true;
  const isCode = param.variant === 'block';

  return (
    <span
      style={{
        display: 'flex',
        flex: '1 1 0',
        minWidth: 0,
        maxWidth: 240,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
        margin: '-5px -8px -5px 0',
      }}
    >
      <CopyCode size={-1} alt roundest noBg={!isCode} value={param.value} truncate={truncate} />
    </span>
  );
};
