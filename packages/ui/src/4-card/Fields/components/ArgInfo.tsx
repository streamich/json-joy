import * as React from 'react';
import {DateTime} from '../../../1-inline/DateTime';
import {Bytes} from '../../../1-inline/Bytes';
import type {ParamInfo} from '../../StructuralMenu/types';

export interface ArgInfoProps {
  param: ParamInfo;
}

/** Value-only read-only info display. The definition cell is rendered by `FieldRow`. */
export const ArgInfo: React.FC<ArgInfoProps> = ({param}) => {
  let content: React.ReactNode = null;
  if (param.render) {
    content = param.render();
  } else if (param.value !== undefined) {
    const variant = param.variant ?? 'text';
    if (variant === 'date') {
      content = <DateTime value={param.value as number | Date | string} />;
    } else if (variant === 'bytes') {
      content = <Bytes value={param.value as number} />;
    } else {
      content = <span>{String(param.value)}</span>;
    }
  }

  return <span style={{display: 'inline-flex', alignItems: 'center'}}>{content}</span>;
};
