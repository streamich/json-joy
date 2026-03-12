import * as React from 'react';
import 'mathlive';
import {rule} from 'nano-theme';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {useT} from 'use-t';
import type {EditProps} from '../../../InlineSliceBehavior';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

const fieldWrapClass = rule({
  d: 'block',
  '& math-field': {
    w: '100%',
    fz: '1.1em',
    pd: '8px',
    bdr: '1px solid rgba(128,128,128,.3)',
    bdrad: '6px',
    outline: 'none',
    d: 'block',
    boxSizing: 'border-box',
  },
  '& math-field:focus': {
    bdr: '1px solid rgba(0,120,212,.6)',
  },
});

const actionsClass = rule({
  d: 'flex',
  gap: '4px',
  pd: '10px 0 0',
  jc: 'flex-end',
});

export const Edit: React.FC<EditProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const fieldRef = React.useRef<HTMLElement | null>(null);

  const initialTex = React.useMemo(
    () => (formatting.range as unknown as Slice<string>).text?.() ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSave = () => {
    const el = fieldRef.current as any;
    if (!el) return;
    const newTex: string = el.value ?? '';
    const editor = formatting.state.txt.editor;
    const range = formatting.range as unknown as Slice<string>;
    editor.insert0(range, newTex);
    onSave();
  };

  return (
    <div>
      <div className={fieldWrapClass}>
        {/* math-field custom element — registered by `import 'mathlive'`.
            Using React.createElement to bypass JSX IntrinsicElements check. */}
        {React.createElement('math-field', {
          ref: fieldRef,
          value: initialTex,
          'virtual-keyboard-mode': 'onfocus',
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSave();
            }
          },
        })}
      </div>
      <div className={actionsClass}>
        <BasicButton fill size={-1} onClick={handleSave}>
          {t('Save')}
        </BasicButton>
      </div>
    </div>
  );
};
