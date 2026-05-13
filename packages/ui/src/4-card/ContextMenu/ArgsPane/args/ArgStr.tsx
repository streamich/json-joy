import * as React from 'react';
import {Input, type InputProps} from '../../../../2-inline-block/Input';
import {FormRow} from '../../../../3-list-item/FormRow';
import {argBlockCss} from './css';
import {ArgStrCompact} from './ArgStrCompact';
import type {ParamStr} from '../../../StructuralMenu/types';

export interface ArgStrProps extends InputProps {
  param: ParamStr;
  value: string;
  compact?: boolean;
}

export const ArgStr: React.FC<ArgStrProps> = (props) => {
  if (props.compact) return <ArgStrCompact {...props} />;
  const {param, compact: _compact, onEnter, ...rest} = props;
  const handleEnter: React.KeyboardEventHandler = (event) => {
    onEnter?.(event);
    param.onSubmit?.();
  };
  return (
    <div className={argBlockCss}>
      <FormRow title={param.display?.() ?? param.name ?? param.id} optional={param.optional}>
        <Input {...rest} onEnter={handleEnter} placeholder={param.placeholder} type="text" />
      </FormRow>
    </div>
  );
};
