import ExternalLinkIcon__svg from 'iconista/lib/react/lucide/external-link';
import {rule} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {Bytes} from '../../1-inline/Bytes';
import {ColorValue} from '../../1-inline/ColorValue';
import {DateTime} from '../../1-inline/DateTime';
import {Donut} from '../../1-inline/Donut';
import {Duration} from '../../1-inline/Duration';
import {Meta} from '../../1-inline/Meta';
import {Num} from '../../1-inline/Num';
import {TechText} from '../../1-inline/TechText';
import {TimeAgo} from '../../1-inline/TimeAgo';
import {useSpacingTrace} from '../../context/traces';
import type {MenuItem, Param} from '../StructuralMenu/types';
import {isMultiple, SelectMultiValue} from './components/ArgSelect';
import {FieldHint} from './components/FieldHint';
import {EmptyValue} from './EmptyValue';
import {ExternalFieldFallback, useExternalFieldRenderer} from './external';
import {numHint, numInvalid} from './num';
import {strHint, strInvalid} from './str';

const unwrap = (v: unknown): unknown =>
  v && typeof v === 'object' && 'value' in (v as Record<string, unknown>) ? (v as {value: unknown}).value : v;

export const isEmptyValue = (param: Param, value: unknown): boolean => {
  if (param.kind === 'bool') return false;
  if (param.kind === 'external') return false;
  // Multi-select renders its own empty placeholder + validity marker.
  if (param.kind === 'select' && isMultiple(param)) return false;
  const v = unwrap(value);
  return v === undefined || v === null || v === '';
};

export const requiredEmpty = (param: Param, value: unknown): boolean =>
  !param.optional && !param.defaultable && !param.readonly && isEmptyValue(param, value);

/** Scaffolding prefixes muted in resting str values (the rest stays normal). */
const AFFIXES = ['https://', 'http://', 'mailto:', '@'];

const linkClass = rule({
  d: 'inline-flex',
  ai: 'center',
  col: 'inherit',
  op: 0.35,
  flexShrink: 0,
  '&:hover': {
    op: 1,
  },
});

/** Single-value select/enum display: option label + trailing icon. */
const singleSelectLabel = (options: MenuItem[], v: unknown): React.ReactNode => {
  const sel = options.find((o) => (o.id ?? o.name) === v);
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <span>{sel ? (sel.display?.() ?? sel.name ?? sel.id ?? '') : String(v ?? '')}</span>
      {sel?.icon ? sel.icon() : null}
    </span>
  );
};

export interface FieldValueViewProps {
  param: Param;
  value: unknown;
}

export const FieldValueView: React.FC<FieldValueViewProps> = ({param, value}) => {
  const [t] = useT();
  const external = useExternalFieldRenderer(param.kind === 'external' ? param.external : undefined);
  const spacing = useSpacingTrace(0.5);
  const v = unwrap(value);
  switch (param.kind) {
    case 'external':
      if (!external) return <ExternalFieldFallback value={value} />;
      if (external.isEmpty?.(value)) return <EmptyValue />;
      return <>{external.view({value, config: param.externalConfig})}</>;
    case 'bool': {
      const state = v === null || v === undefined ? null : !!v;
      if (param.label) return <span>{param.label(state)}</span>;
      if (state === null) return <EmptyValue />;
      return <Meta caps>{t(state ? 'Yes' : 'No')}</Meta>;
    }
    case 'color':
      return <ColorValue color={String(v ?? '')} size={Math.round(12 + spacing * 9)} />;
    case 'select':
      if (isMultiple(param)) return <SelectMultiValue param={param} value={value} />;
      return singleSelectLabel(param.options ?? [], v);
    case 'enum':
      return singleSelectLabel(param.options ?? [], v);
    case 'num': {
      if (typeof v !== 'number') return <span style={{fontVariantNumeric: 'tabular-nums'}}>{String(v ?? '')}</span>;
      const body =
        param.view === 'bytes' ? (
          <Bytes value={v} />
        ) : param.view === 'percent' ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
            <Donut progress={v} size={Math.round(10 + spacing * 4)} cutout={0.55} />
            <Num value={Math.round(v * 100)} unit="%" />
          </span>
        ) : param.view === 'duration' ? (
          <Duration value={v} />
        ) : (
          <Num value={v} unit={param.unit} />
        );
      if (!numInvalid(param, v)) return body;
      const hint = numHint(param);
      return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0}}>
          {body}
          <FieldHint warn note={hint?.note || 'Out of range'} label={hint?.label} />
        </span>
      );
    }
    case 'date': {
      const s = String(v ?? '');
      if (!s) return <EmptyValue />;
      const local = param.time ? s : `${s}T00:00`;
      if (param.relative) return <TimeAgo value={local} style={{fontSize: '1em'}} />;
      return <DateTime value={local} dateOnly={!param.time} inherit />;
    }
    case 'str': {
      const s = String(v ?? '');
      const affix = !param.technical && AFFIXES.find((a) => s.startsWith(a) && s.length > a.length);
      const body = param.technical ? (
        <TechText value={s} />
      ) : affix ? (
        <span>
          <span style={{opacity: 0.6}}>{affix}</span>
          {s.slice(affix.length)}
        </span>
      ) : (
        <span>{s}</span>
      );
      if (!strInvalid(param, s)) {
        const url = !param.technical && (s.startsWith('https://') || s.startsWith('http://')) ? s : undefined;
        if (!url) return body;
        return (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0}}>
            <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {body}
            </span>
            <a
              className={linkClass}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLinkIcon__svg width={12} height={12} />
            </a>
          </span>
        );
      }
      const hint = strHint(param);
      return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0}}>
          <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{body}</span>
          <FieldHint warn note={hint?.note || 'Invalid value'} label={hint?.label} />
        </span>
      );
    }
    default:
      return <span>{String(v ?? '')}</span>;
  }
};
