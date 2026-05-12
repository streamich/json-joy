import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {Input} from '../../../../2-inline-block/Input';
import {OptionalBadge} from './OptionalBadge';
import type {ArgStrProps} from './ArgStr';

export const ArgStrCompact: React.FC<ArgStrProps> = ({param, value, onChange, onEnter, focus}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      right={
        <div style={{width: 140, margin: '-5px -8px -5px 0'}}>
          <Input
            size={-3}
            type="text"
            value={value}
            placeholder={param.placeholder}
            focus={focus}
            onChange={onChange}
            onEnter={onEnter}
          />
        </div>
      }
    >
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
