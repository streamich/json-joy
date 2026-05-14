import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {InputChar} from '../../../../2-inline-block/InputChar';
import {argBlockCss} from './css';
import {ArgCharCompact} from './ArgCharCompact';
import type {ParamChar} from '../../../StructuralMenu/types';

export interface DefaultableCharValue {
  def: boolean;
  value: string;
}

export interface ArgCharProps {
  param: ParamChar;
  value: string | DefaultableCharValue;
  compact?: boolean;
  focus?: boolean;
  onChange: (value: string | DefaultableCharValue) => void;
  onEnter?: React.KeyboardEventHandler;
}

const unwrap = (v: ArgCharProps['value']): string => {
  if (v && typeof v === 'object' && 'value' in (v as object)) return String((v as DefaultableCharValue).value ?? '');
  return (v as string) ?? '';
};

export const ArgChar: React.FC<ArgCharProps> = (props) => {
  if (props.compact) return <ArgCharCompact {...props} />;

  const {param, value, onChange, focus} = props;
  const defaultable = !!param.defaultable;

  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <InputChar
          value={unwrap(value)}
          placeholder={param.placeholder}
          focus={focus}
          emoji={param.emoji}
          onChange={(v) => (defaultable ? onChange({def: false, value: v}) : onChange(v))}
        />
      </FormRow>
    </div>
  );
};
