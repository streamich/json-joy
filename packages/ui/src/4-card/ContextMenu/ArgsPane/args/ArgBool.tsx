import * as React from 'react';
import {FormRow} from '../../../../3-list-item/FormRow';
import {Checkbox} from '../../../../2-inline-block/Checkbox';
import {argBlockCss} from './css';
import {ArgBoolCompact} from './ArgBoolCompact';
import type {ParamBool} from '../../../StructuralMenu/types';

export interface DefaultableBoolValue {
  def: boolean;
  value: boolean;
}

export interface ArgBoolProps {
  param: ParamBool;
  value: boolean | DefaultableBoolValue;
  compact?: boolean;
  onChange: (value: boolean | DefaultableBoolValue) => void;
}

const unwrapBool = (v: ArgBoolProps['value']): boolean => {
  if (v && typeof v === 'object' && 'value' in v) return !!(v as DefaultableBoolValue).value;
  return !!v;
};

export const ArgBool: React.FC<ArgBoolProps> = (props) => {
  if (props.compact) return <ArgBoolCompact {...props} />;
  const {param, value, onChange} = props;
  const v = unwrapBool(value);
  return (
    <div className={argBlockCss}>
      <FormRow
        title={param.display?.() ?? param.name ?? param.id}
        optional={param.optional}
        description={param.description}
        right
      >
        <div style={{width: 40}}>
          <Checkbox on={v} small onChange={() => onChange(!v)} />
        </div>
      </FormRow>
    </div>
  );
};
