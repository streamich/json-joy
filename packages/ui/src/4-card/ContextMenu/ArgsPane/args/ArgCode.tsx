import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {CopyCode} from '../../../../1-inline/CopyCode';
import {TextBlock} from '../../../../5-block/TextBlock';
import {MiniTitle} from '../../../../3-list-item/MiniTitle';
import {OptionalBadge} from './OptionalBadge';
import {argBlockCss} from './css';
import type {ParamCode} from '../../../StructuralMenu/types';

export interface ArgCodeProps {
  param: ParamCode;
  compact?: boolean;
}

/** Read-only code/ID display with copy-to-clipboard button. */
export const ArgCode: React.FC<ArgCodeProps> = ({param, compact}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

  if (param.variant === 'block' && !compact) {
    return (
      <div className={argBlockCss} style={{minWidth: 0}}>
        <div style={{padding: '0 0 4px'}}>
          <MiniTitle literal>{label}</MiniTitle>
        </div>
        <TextBlock src={param.value} select />
      </div>
    );
  }

  const truncate = param.truncate ?? true;
  const isCode = param.variant === 'block';

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      style={{paddingTop: 6, paddingBottom: 6}}
      right={
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
          <CopyCode
            size={-1}
            alt
            roundest
            noBg={!isCode}
            value={param.value}
            truncate={truncate}
          />
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
