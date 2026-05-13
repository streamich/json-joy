import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {InputChar} from '../../../../2-inline-block/InputChar';
import {argBlockCss} from './css';
import {ArgCharCompact} from './ArgCharCompact';
import type {ParamChar} from '../../../StructuralMenu/types';

export interface ArgCharProps {
  param: ParamChar;
  value: string;
  compact?: boolean;
  focus?: boolean;
  onChange: (value: string) => void;
  onEnter?: React.KeyboardEventHandler;
}

export const ArgChar: React.FC<ArgCharProps> = (props) => {
  if (props.compact) return <ArgCharCompact {...props} />;

  const {param, value, onChange, focus} = props;

  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <InputChar
          value={value}
          placeholder={param.placeholder}
          focus={focus}
          emoji={param.emoji}
          onChange={onChange}
        />
      </FormRow>
    </div>
  );
};
