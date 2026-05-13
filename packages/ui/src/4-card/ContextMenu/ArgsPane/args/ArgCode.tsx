import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {CopyCode} from '../../../../1-inline/CopyCode';
import {OptionalBadge} from './OptionalBadge';
import type {ParamCode} from '../../../StructuralMenu/types';

export interface ArgCodeProps {
  param: ParamCode;
  compact?: boolean;
}

/** Read-only code/ID display with copy-to-clipboard button. */
export const ArgCode: React.FC<ArgCodeProps> = ({param}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      style={{paddingTop: 6, paddingBottom: 6}}
      right={
        <span style={{display: 'inline-flex', alignItems: 'center', margin: '-5px -8px -5px 0'}}>
          <CopyCode size={-1} alt roundest noBg value={param.value} truncate={param.truncate} />
        </span>
      }
    >
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
