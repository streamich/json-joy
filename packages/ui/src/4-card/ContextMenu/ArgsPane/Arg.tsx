import * as React from 'react';
import {ArgStr} from './args/ArgStr';
import {ArgNum} from './args/ArgNum';
import {ArgBool} from './args/ArgBool';
import {ArgColor} from './args/ArgColor';
import {ArgSelect} from './args/ArgSelect';
import {ArgEnum} from './args/ArgEnum';
import type {Param} from '../../StructuralMenu/types';

export interface ArgControlProps {
  param: Param;
  value: unknown;
  focus?: boolean;
  compact?: boolean;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
}

export const Arg: React.FC<ArgControlProps> = ({param, value, onChange, onSubmit, focus, compact}) => {
  switch (param.kind) {
    case 'str':
      return (
        <ArgStr
          param={param}
          value={(value as string) ?? ''}
          onChange={onChange}
          onEnter={onSubmit}
          focus={focus}
          compact={compact}
        />
      );
    case 'num':
      return (
        <ArgNum
          param={param}
          value={value as any}
          onChange={onChange}
          onEnter={onSubmit}
          focus={focus}
          compact={compact}
        />
      );
    case 'bool':
      return <ArgBool param={param} value={value as any} onChange={onChange} compact={compact} />;
    case 'color':
      return (
        <ArgColor
          param={param}
          value={value as any}
          onChange={onChange}
          onEnter={onSubmit}
          focus={focus}
          compact={compact}
        />
      );
    case 'select':
      return (
        <ArgSelect
          param={param}
          value={value as any}
          onChange={onChange}
          onSubmit={onSubmit}
          compact={compact}
        />
      );
    case 'enum':
      return <ArgEnum param={param} value={value as any} onChange={onChange} compact={compact} />;
    default:
      return null;
  }
};
