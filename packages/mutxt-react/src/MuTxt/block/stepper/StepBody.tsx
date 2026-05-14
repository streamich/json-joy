import * as React from 'react';
import {rule} from 'nano-theme';
import {ReactEditor, useReadOnly, useSlateStatic} from 'slate-react';
import {Transforms, type Editor} from 'slate';
import {FlexibleInput} from 'flexible-input';
import {useT} from 'use-t';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {BlockPlaceholder} from '../../components/blocks/BlockPlaceholder';
import {
  StripBarHandle,
  stripBarHandleFillClass,
  stripBarHandleTriggerClass,
} from '../../components/blocks/StripBarHandle';
import {isEmptyBlock} from '../../util';
import {fgVar} from '../../custom-style/css';
import type {ListItemElement, StepState} from '../../types';

const contentColClass = rule({
  d: 'block',
  flex: '1 1 auto',
  minW: 0,
  pad: '1px 0 0 0',
});

const titleClass = rule({
  d: 'block',
  fw: 600,
  fz: '14px',
  lh: 1.35,
  mrb: '2px',
});

const descClass = rule({
  d: 'block',
  fz: '12px',
  lh: 1.45,
  mrb: '18px',
});

const stripSlotClass = rule({
  pos: 'relative',
  d: 'block',
  h: 0,
});

const stripOverlayClass = rule({
  pos: 'absolute',
  l: '0',
  t: '-8px',
  d: 'flex',
  fld: 'row',
  ai: 'center',
  gap: '8px',
  z: 1,
  pe: 'none',
});

const bodyClass = rule({
  pos: 'relative',
  d: 'block',
  minW: '0',
});

export const stepHoverStripBarClass = rule({
  [`&:hover .${stripBarHandleTriggerClass}`]: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  [`&:hover .${stripBarHandleTriggerClass} .${stripBarHandleFillClass}`]: {
    width: '100%',
  },
});

/**
 * Wire Enter/Tab and Escape for an inline metadata input inside a slate block.
 */
const bindVoidInputKeyDown = (
  el: HTMLElement | null,
  editor: ReactEditor,
  onCancel?: () => void,
): (() => void) => {
  if (!el) return () => {};
  const handler: EventListener = (evt: Event) => {
    const e = evt as KeyboardEvent;
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    }
  };
  el.addEventListener('keydown', handler);
  return () => el.removeEventListener('keydown', handler);
};

const useInlineField = (
  editor: Editor,
  element: ListItemElement,
  field: 'stepTitle' | 'stepDesc',
) => {
  const elementValue = (element[field] ?? '') as string;
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(elementValue);
  const focusedRef = React.useRef(false);
  React.useEffect(() => {
    if (!focusedRef.current) setDraft(elementValue);
  }, [elementValue]);
  const commit = React.useCallback(() => {
    focusedRef.current = false;
    const next = draft.trim();
    try {
      const path = ReactEditor.findPath(editor as ReactEditor, element);
      if (next) {
        Transforms.setNodes(editor, {[field]: next} as Partial<ListItemElement>, {at: path});
      } else {
        Transforms.unsetNodes(editor, field, {at: path});
      }
    } catch {}
    if (!next) setEditing(false);
  }, [editor, element, draft, field]);
  return {editing, setEditing, draft, setDraft, focusedRef, commit};
};

export interface StepBodyProps {
  element: ListItemElement;
  state: StepState;
  children: React.ReactNode;
}

export const StepBody: React.FC<StepBodyProps> = ({element, state, children}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const styles = useStyles();
  const [t] = useT();

  const titleField = useInlineField(editor, element, 'stepTitle');
  const descField = useInlineField(editor, element, 'stepDesc');

  const [titleInputEl, setTitleInputEl] = React.useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (readOnly) return;
    return bindVoidInputKeyDown(titleInputEl, editor as ReactEditor, () => {
      titleField.setDraft(element.stepTitle ?? '');
      titleField.focusedRef.current = false;
      if (!element.stepTitle) titleField.setEditing(false);
    });
  }, [titleInputEl, readOnly, element.stepTitle, editor, titleField]);

  const [descInputEl, setDescInputEl] = React.useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (readOnly) return;
    return bindVoidInputKeyDown(descInputEl, editor as ReactEditor, () => {
      descField.setDraft(element.stepDesc ?? '');
      descField.focusedRef.current = false;
      if (!element.stepDesc) descField.setEditing(false);
    });
  }, [descInputEl, readOnly, element.stepDesc, editor, descField]);

  const hasTitle = !!element.stepTitle;
  const hasDesc = !!element.stepDesc;
  const showTitleField = hasTitle || titleField.editing;
  const showDescField = hasDesc || descField.editing;
  const showTitleBar = !readOnly && !showTitleField;
  const showDescBar = !readOnly && !showDescField;

  const titleColor = state === 'pending' ? fgVar(35, styles.g(0.35)) : 'inherit';
  const descColor = fgVar(45, styles.g(0.45));

  const renderBar = (kind: 'title' | 'desc') => {
    const label = kind === 'title' ? t('Add title') : t('Add description');
    return (
      <StripBarHandle
        tooltip={label}
        ariaLabel={label}
        onActivate={() => {
          if (kind === 'title') titleField.setEditing(true);
          else descField.setEditing(true);
        }}
      />
    );
  };

  // Top strip slot hosts title bar (if needed) and the description bar when
  // there's no title field above the description. Mid slot hosts the
  // description bar when the title field IS shown, so it sits between title
  // and body.
  const topSlotHasTitle = showTitleBar;
  const topSlotHasDesc = showDescBar && !showTitleField;
  const midSlotHasDesc = showDescBar && showTitleField;
  const showTopSlot = topSlotHasTitle || topSlotHasDesc;

  return (
    <span className={contentColClass}>
      {showTopSlot && (
        <span className={stripSlotClass} contentEditable={false}>
          <span className={stripOverlayClass}>
            {topSlotHasTitle && renderBar('title')}
            {topSlotHasDesc && renderBar('desc')}
          </span>
        </span>
      )}
      {showTitleField ? (
        <span className={titleClass} contentEditable={false} style={{color: titleColor}}>
          {readOnly ? (
            element.stepTitle
          ) : (
            <FlexibleInput
              inp={setTitleInputEl}
              value={titleField.draft}
              minWidth={60}
              focus={titleField.editing && !hasTitle}
              typeahead={titleField.draft ? '' : t('Add title…')}
              onChange={(e) => titleField.setDraft(e.target.value)}
              onFocus={() => {
                titleField.focusedRef.current = true;
              }}
              onBlur={titleField.commit}
            />
          )}
        </span>
      ) : null}
      {midSlotHasDesc && (
        <span className={stripSlotClass} contentEditable={false}>
          <span className={stripOverlayClass} style={{top: '-6px'}}>
            {renderBar('desc')}
          </span>
        </span>
      )}
      {showDescField ? (
        <span className={descClass} contentEditable={false} style={{color: descColor}}>
          {readOnly ? (
            element.stepDesc
          ) : (
            <FlexibleInput
              inp={setDescInputEl}
              value={descField.draft}
              minWidth={120}
              focus={descField.editing && !hasDesc}
              typeahead={descField.draft ? '' : t('Add description…')}
              onChange={(e) => descField.setDraft(e.target.value)}
              onFocus={() => {
                descField.focusedRef.current = true;
              }}
              onBlur={descField.commit}
            />
          )}
        </span>
      ) : null}
      <span className={bodyClass} style={{opacity: state === 'done' ? 0.72 : 1}}>
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </span>
    </span>
  );
};
