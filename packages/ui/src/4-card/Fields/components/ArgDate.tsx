import * as React from 'react';
import {InputDate} from '../../../2-inline-block/InputDate';
import {useSpacingTrace} from '../../../context/traces';
import type {ParamDate} from '../../StructuralMenu/types';
import {dateInvalid} from '../date';

export interface ArgDateProps {
  param: ParamDate;
  value: unknown;
  onChange: (value: string) => void;
  onEnter?: React.KeyboardEventHandler;
  focus?: boolean;
  /** Fill the available width (reveal editor); otherwise a fixed box. */
  stretch?: boolean;
}

export const ArgDate: React.FC<ArgDateProps> = ({param, value, onChange, onEnter, focus, stretch}) => {
  const [invalid, setInvalid] = React.useState(false);
  const size = useSpacingTrace(0.5) >= 0.7 ? -1 : -3;
  const v = typeof value === 'string' ? value : '';

  return (
    <div style={{width: stretch ? '100%' : param.time ? 190 : 150, margin: '-5px 0'}}>
      <InputDate
        size={size}
        time={param.time}
        min={param.min}
        max={param.max}
        invalid={invalid}
        value={v}
        focus={focus}
        onChange={(next) => {
          onChange(next);
          if (invalid) setInvalid(dateInvalid(param, next)); // clear as soon as the value is fixed
        }}
        onEnter={onEnter}
        onBlur={() => setInvalid(dateInvalid(param, v))}
      />
    </div>
  );
};
