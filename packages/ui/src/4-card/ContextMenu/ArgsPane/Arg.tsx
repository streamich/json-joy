import * as React from 'react';
import {ArgStr} from './args/ArgStr';
import {ArgNum} from './args/ArgNum';
import {ArgBool} from './args/ArgBool';
import {ArgBtn} from './args/ArgBtn';
import {ArgCode} from './args/ArgCode';
import {ArgInfo} from './args/ArgInfo';
import {ArgColor} from './args/ArgColor';
import {ArgSelect} from './args/ArgSelect';
import {ArgEnum} from './args/ArgEnum';
import {ArgChar} from './args/ArgChar';
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
    case 'char':
      return (
        <ArgChar
          param={param}
          value={(value as string) ?? ''}
          onChange={onChange}
          focus={focus}
          compact={compact}
        />
      );
    case 'btn':
      return <ArgBtn param={param} compact={compact} />;
    case 'code':
      return <ArgCode param={param} compact={compact} />;
    case 'info':
      return <ArgInfo param={param} compact={compact} />;
    default:
      return null;
  }
};
