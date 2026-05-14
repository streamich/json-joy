import * as React from 'react';
import {Input, type InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import {ArgStrCompact} from './ArgStrCompact';
import type {ParamStr} from '../../../StructuralMenu/types';

export interface DefaultableStrValue {
  def: boolean;
  value: string;
}

export interface ArgStrProps extends Omit<InputProps, 'value' | 'onChange'> {
  param: ParamStr;
  value: string | DefaultableStrValue;
  compact?: boolean;
  onChange: (value: string | DefaultableStrValue) => void;
}

const unwrap = (v: ArgStrProps['value']): string => {
  if (v && typeof v === 'object' && 'value' in (v as object)) return String((v as DefaultableStrValue).value ?? '');
  return (v as string) ?? '';
};

export const ArgStr: React.FC<ArgStrProps> = (props) => {
  if (props.compact) return <ArgStrCompact {...props} />;
  const {param, compact: _compact, onEnter, value, onChange, ...rest} = props;
  const defaultable = !!param.defaultable;
  const handleEnter: React.KeyboardEventHandler = (event) => {
    onEnter?.(event);
    param.onSubmit?.();
  };
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <Input
          {...rest}
          onEnter={handleEnter}
          value={unwrap(value)}
          onChange={(v: string) => (defaultable ? onChange({def: false, value: v}) : onChange(v))}
          placeholder={param.placeholder}
          type="text"
        />
      </FormRow>
    </div>
  );
};
