import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {DateTime} from '../../../../1-inline/DateTime';
import {Bytes} from '../../../../1-inline/Bytes';
import {OptionalBadge} from './OptionalBadge';
import type {ParamInfo} from '../../../StructuralMenu/types';

export interface ArgInfoProps {
  param: ParamInfo;
  compact?: boolean;
}

export const ArgInfo: React.FC<ArgInfoProps> = ({param}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

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

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      style={{paddingTop: 6, paddingBottom: 6}}
      right={<span style={{display: 'inline-flex', alignItems: 'center'}}>{content}</span>}
    >
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
