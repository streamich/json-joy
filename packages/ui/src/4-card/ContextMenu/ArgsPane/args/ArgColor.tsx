import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import {InputColor, type InputColorProps} from '../../../../2-inline-block/InputColor';
import {ArgColorCompact} from './ArgColorCompact';
import type {ParamColor} from '../../../StructuralMenu/types';

export interface DefaultableColorValue {
  def: boolean;
  value: string;
}

export interface ArgColorProps extends Omit<InputColorProps, 'value' | 'onChange'> {
  param: ParamColor;
  value: string | DefaultableColorValue;
  compact?: boolean;
  onChange?: (value: string | DefaultableColorValue) => void;
}

const unwrapColor = (v: ArgColorProps['value']): string => {
  if (v && typeof v === 'object' && 'value' in v) return String((v as DefaultableColorValue).value ?? '');
  return (v as string) ?? '';
};

export const ArgColor: React.FC<ArgColorProps> = (props) => {
  if (props.compact) return <ArgColorCompact {...props} />;
  const {param, compact: _compact, value, onChange, ...rest} = props;
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <InputColor
          {...rest}
          value={unwrapColor(value)}
          onChange={onChange as ((v: string) => void) | undefined}
          placeholder={'#hex'}
        />
      </FormRow>
    </div>
  );
};
