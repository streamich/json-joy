import * as React from 'react';
import {type InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import {InputNumber} from '../../../../2-inline-block/InputNumber';
import {ArgNumCompact} from './ArgNumCompact';
import type {ParamNum} from '../../../StructuralMenu/types';

export interface DefaultableNumValue {
  def: boolean;
  value: number;
}

export interface ArgNumProps extends Omit<InputProps, 'value' | 'onChange'> {
  param: ParamNum;
  value: number | DefaultableNumValue | undefined;
  compact?: boolean;
  onChange: (value: number | DefaultableNumValue) => void;
}

const unwrapNum = (v: ArgNumProps['value']): number => {
  if (v && typeof v === 'object' && 'value' in v) return Number((v as DefaultableNumValue).value) || 0;
  return Number(v) || 0;
};

export const ArgNum: React.FC<ArgNumProps> = (props) => {
  if (props.compact) return <ArgNumCompact {...props} />;

  const {param, value, onChange, compact: _compact, ...rest} = props;

  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <InputNumber
          {...rest}
          value={unwrapNum(value)}
          onChange={(txt) => {
            const num = Number(txt);
            if (!Number.isNaN(num)) onChange(num);
          }}
        />
      </FormRow>
    </div>
  );
};
