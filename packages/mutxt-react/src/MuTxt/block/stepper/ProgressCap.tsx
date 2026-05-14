import * as React from 'react';
import {rule} from 'nano-theme';
import {ReactEditor, useReadOnly, useSlateStatic} from 'slate-react';
import {Transforms} from 'slate';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useT} from 'use-t';
import type {ListItemElement, StepperListElement} from '../../types';
import CloseIcon__svg from 'iconista/lib/react/lucide/x';

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CloseIcon__svg width={14} height={14} {...props} />
);

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '8px',
  pad: '0 0 10px 0',
  mar: '0 0 6px 0',
  fz: '12px',
  lh: 1.4,
});

const labelClass = rule({
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  fw: 500,
});

const trackClass = rule({
  pos: 'relative',
  d: 'inline-block',
  w: '120px',
  h: '4px',
  bdrad: '4px',
  ov: 'hidden',
});

const fillClass = rule({
  pos: 'absolute',
  t: 0,
  l: 0,
  h: '100%',
  trs: 'width .2s ease, background-color .2s ease',
  bdrad: '4px',
});

const closeClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '20px',
  h: '20px',
  pad: 0,
  bd: 'none',
  bg: 'transparent',
  bdrad: '4px',
  cur: 'pointer',
  op: 0.55,
  trs: 'opacity .12s, background-color .12s',
  '&:hover': {
    op: 1,
  },
});

const countDone = (children: ListItemElement[]): number => {
  let n = 0;
  for (const c of children) if ((c as ListItemElement).stepState === 'done') n++;
  return n;
};

export interface ProgressCapProps {
  element: StepperListElement;
}

/** Cap row above a stepper list summarizing how many items are `done` of the total. */
export const ProgressCap: React.FC<ProgressCapProps> = ({element}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const styles = useStyles();
  const [t] = useT();

  const total = element.children.length;
  const done = countDone(element.children);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const onDismiss = React.useCallback(() => {
    if (readOnly) return;
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.unsetNodes(editor, 'progress', {at: path});
    } catch {}
  }, [editor, element, readOnly]);

  const positive = styles.positive.toString();
  const trackBg = styles.g(0.85);
  const labelColor = styles.g(0.4);
  const allDone = total > 0 && done === total;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('Stepper progress')}
      className={rowClass}
      contentEditable={false}
      style={{color: labelColor}}
    >
      <span className={labelClass}>
        <span>{t('Progress')}</span>
        <span className={trackClass} style={{background: trackBg}} aria-hidden="true">
          <span className={fillClass} style={{width: `${pct}%`, background: positive}} />
        </span>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>
          {done} / {total} {allDone ? t('done') : ''}
        </span>
      </span>
      {!readOnly && (
        <button
          type="button"
          className={closeClass}
          aria-label={t('Hide progress')}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};
