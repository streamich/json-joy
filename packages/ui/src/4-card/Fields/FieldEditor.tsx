import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import {BasicTooltip} from '../BasicTooltip';
import {ExternalFieldFallback, useExternalFieldRenderer} from './external';
import {FieldControl} from './FieldControl';
import {isEmptyValue} from './FieldValueView';
import type {MenuItem, Param} from '../StructuralMenu/types';

export interface FieldEditorProps {
  param: Param;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Close the reveal popover. The value is already committed via `onChange`. */
  onCommit: () => void;
  /** Pane-level submit (Apply button), if the host wires one. */
  onSubmit?: () => void;
  /** Persist option-definition edits (create / reorder / delete) for select. */
  onOptionsChange?: (options: MenuItem[]) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  param,
  value,
  onChange,
  onCommit,
  onSubmit,
  onOptionsChange,
}) => {
  const [t] = useT();
  const external = useExternalFieldRenderer(param.kind === 'external' ? param.external : undefined);

  if (param.kind === 'external') {
    const config = param.externalConfig;
    if (external?.editor)
      return <div style={{minWidth: 200}}>{external.editor({value, onChange, onCommit, config})}</div>;
    if (external)
      return (
        <div style={{display: 'flex', alignItems: 'center', padding: 10, minWidth: 180}}>
          {external.control({
            value,
            onChange,
            onSubmit: () => {
              onSubmit?.();
              onCommit();
            },
            focus: true,
            config,
          })}
        </div>
      );
    return (
      <div style={{padding: 10}}>
        <ExternalFieldFallback value={value} />
      </div>
    );
  }

  const multiline = param.kind === 'str' && !!param.multiline;
  const clearable =
    !!param.optional &&
    !param.defaultable &&
    (param.kind === 'str' || param.kind === 'num' || param.kind === 'date') &&
    !isEmptyValue(param, value);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 6,
        padding: 10,
        minWidth: multiline ? 280 : 180,
      }}
    >
      <FieldControl
        param={param}
        value={value}
        onChange={onChange}
        onSubmit={() => {
          onSubmit?.();
          onCommit();
        }}
        focus
        stretch
      />
      {clearable && (
        <BasicTooltip renderTooltip={() => t('Clear')}>
          <BasicButtonClose
            size={20}
            aria-label={t('Clear')}
            onClick={() => {
              onChange(param.kind === 'num' ? undefined : '');
              onCommit();
            }}
          />
        </BasicTooltip>
      )}
    </div>
  );
};
