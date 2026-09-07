import * as React from 'react';
import type {Param} from '../StructuralMenu/types';
import {ArgBool} from './components/ArgBool';
import {ArgBtn} from './components/ArgBtn';
import {ArgChar} from './components/ArgChar';
import {ArgCode} from './components/ArgCode';
import {ArgColor} from './components/ArgColor';
import {ArgDate} from './components/ArgDate';
import {ArgEnum} from './components/ArgEnum';
import {ArgInfo} from './components/ArgInfo';
import {ArgNum} from './components/ArgNum';
import {ArgSelect} from './components/ArgSelect';
import {ArgStr} from './components/ArgStr';
import {ExternalFieldFallback, useExternalFieldRenderer} from './external';

export interface FieldControlProps {
  param: Param;
  value: unknown;
  focus?: boolean;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
  /** Value-cell alignment, forwarded to controls. */
  align?: 'left' | 'right';
  /** Fill the available width (reveal editor), forwarded to controls that support it. */
  stretch?: boolean;
}

/**
 * Routes a {@link Param} to its value-editing control by `kind`. The single
 * dispatch point for a field's **value cell** — every control is value-only
 * (just the editor); the definition cell (icon + name) is rendered by
 * `FieldRow`. Controls live in `./components`.
 */
export const FieldControl: React.FC<FieldControlProps> = ({
  param,
  value,
  onChange,
  onSubmit,
  focus,
  align,
  stretch,
}) => {
  const external = useExternalFieldRenderer(param.kind === 'external' ? param.external : undefined);
  switch (param.kind) {
    case 'str':
      return (
        <ArgStr
          param={param}
          value={value as any}
          onChange={onChange}
          onEnter={onSubmit}
          focus={focus}
          stretch={stretch}
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
          stretch={stretch}
        />
      );
    case 'date':
      return (
        <ArgDate param={param} value={value} onChange={onChange} onEnter={onSubmit} focus={focus} stretch={stretch} />
      );
    case 'bool':
      return <ArgBool param={param} value={value as any} onChange={onChange} align={align} />;
    case 'color':
      return <ArgColor param={param} value={value as any} onChange={onChange} onEnter={onSubmit} focus={focus} />;
    case 'select':
      return <ArgSelect param={param} value={value as any} onChange={onChange} onSubmit={onSubmit} />;
    case 'enum':
      return <ArgEnum param={param} value={value as any} onChange={onChange} />;
    case 'char':
      return (
        <ArgChar
          param={param}
          value={value as any}
          onChange={onChange}
          onEnter={onSubmit}
          focus={focus}
          stretch={stretch}
        />
      );
    case 'btn':
      return <ArgBtn param={param} />;
    case 'code':
      return <ArgCode param={param} />;
    case 'info':
      return <ArgInfo param={param} />;
    case 'external':
      return external ? (
        <>{external.control({value, onChange, onSubmit, focus, config: param.externalConfig})}</>
      ) : (
        <ExternalFieldFallback value={value} />
      );
    default:
      return null;
  }
};
