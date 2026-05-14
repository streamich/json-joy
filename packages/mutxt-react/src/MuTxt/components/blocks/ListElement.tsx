import * as React from 'react';
import {rule} from 'nano-theme';
import {Editor, Element as SlateElement} from 'slate';
import {ReactEditor, type RenderElementProps, useReadOnly, useSlateStatic} from 'slate-react';
import {setChecklistItemChecked} from '../../behavior';
import {BlockPlaceholder} from './BlockPlaceholder';
import {fontFamilyOf} from '../../behavior/font';
import {lhVar} from '../../custom-style/css';
import {isEmptyBlock} from '../../util';
import {StepperItem} from '../../block/stepper/StepperItem';
import {ProgressCap} from '../../block/stepper/ProgressCap';
import type {
  BulletedListElement,
  ChecklistListElement,
  ListItemElement as ListItemNode,
  NumberedListElement,
  StepperListElement,
} from '../../types';

const listClass = rule({
  m: '0 0 16px',
  paddingInlineStart: '24px',
});

const checklistClass = rule({
  m: '0 0 16px',
  paddingInlineStart: '24px',
  listStyle: 'none',
});

const itemClass = rule({
  pos: 'relative',
  m: '0 0 11px',
  lh: lhVar('1.7'),
});

const checklistItemClass = rule({
  pos: 'relative',
  m: '0 0 11px',
  lh: lhVar('1.7'),
  listStyle: 'none',
});

const checkboxWrapClass = rule({
  pos: 'absolute',
  insetInlineStart: '-24px',
  t: '6px',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flexShrink: 0,
});

const checkboxClass = rule({
  w: '16px',
  h: '16px',
  mar: 0,
  bd: '1px solid rgba(127,127,127,0.4)',
  bdrad: '4px',
  appearance: 'none',
  d: 'grid',
  placeContent: 'center',
  cur: 'pointer',
  '&::before': {
    content: '""',
    w: '12px',
    h: '12px',
    trs: '120ms transform ease-in-out',
    bg: '#fff',
    clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
    transform: 'scale(0)',
  },
  '&:checked': {
    bg: '#2f8f4e',
    borderColor: '#2f8f4e',
  },
  '&:checked::before': {
    transform: 'scale(.7)',
  },
});

const checklistContentClass = rule({
  d: 'block',
  minW: '0',
});

const stepperClass = rule({
  m: '0 0 16px',
  pad: '4px 0 0 0',
  listStyle: 'none',
});

export interface ListContainerElementProps extends RenderElementProps {
  element: BulletedListElement | NumberedListElement | ChecklistListElement | StepperListElement;
}

export interface ListItemElementProps extends RenderElementProps {
  element: ListItemNode;
}

export const ListContainerElement: React.FC<ListContainerElementProps> = ({attributes, children, element}) => {
  if (element.type === 'checklist') {
    return (
      <ul {...attributes} className={checklistClass}>
        {children}
      </ul>
    );
  }
  if (element.type === 'stepper') {
    return (
      <ol {...attributes} className={stepperClass} aria-label="Stepper">
        {element.progress ? <ProgressCap element={element} /> : null}
        {children}
      </ol>
    );
  }
  if (element.type === 'ol') {
    return (
      <ol
        {...attributes}
        className={listClass}
        style={{paddingInlineStart: '26px', listStyleType: element.olType ?? 'decimal'}}
      >
        {children}
      </ol>
    );
  }
  return (
    <ul {...attributes} className={listClass} style={{listStyleType: element.ulType ?? 'disc'}}>
      {children}
    </ul>
  );
};

export const ListItemElement: React.FC<ListItemElementProps> = ({attributes, children, element}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();

  const parentType = React.useMemo(() => {
    try {
      const path = ReactEditor.findPath(editor, element);
      const [parent] = Editor.parent(editor, path);
      return SlateElement.isElement(parent) ? parent.type : null;
    } catch {
      return null;
    }
  }, [editor, element]);

  const isChecklistItem = parentType === 'checklist';
  const isStepperItem = parentType === 'stepper';

  const onToggle = React.useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (readOnly || !isChecklistItem) return;
      const path = ReactEditor.findPath(editor, element);
      setChecklistItemChecked(editor, path, !element.checked);
    },
    [editor, element, isChecklistItem, readOnly],
  );

  if (isStepperItem) {
    return <StepperItem attributes={attributes} element={element}>{children}</StepperItem>;
  }

  if (!isChecklistItem) {
    return (
      <li
        {...attributes}
        className={itemClass}
        style={{textAlign: element.align, fontFamily: fontFamilyOf(element.font)}}
      >
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </li>
    );
  }

  return (
    <li
      {...attributes}
      className={checklistItemClass}
      style={{textAlign: element.align, fontFamily: fontFamilyOf(element.font)}}
    >
      <span className={checkboxWrapClass} contentEditable={false}>
        <input
          className={checkboxClass}
          type="checkbox"
          checked={!!element.checked}
          readOnly
          disabled={readOnly}
          tabIndex={-1}
          onMouseDown={onToggle}
        />
      </span>
      <span
        className={checklistContentClass}
        style={{
          textDecoration: element.checked ? 'line-through' : undefined,
          opacity: element.checked ? 0.68 : 1,
        }}
      >
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </span>
    </li>
  );
};
