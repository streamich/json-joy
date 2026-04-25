import * as React from 'react';
import {rule} from 'nano-theme';
import {Editor, Element as SlateElement} from 'slate';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ReactEditor, type RenderElementProps, useReadOnly, useSlateStatic} from 'slate-react';
import {setChecklistItemChecked} from '../../behavior';
import {BlockPlaceholder} from './BlockPlaceholder';
import {isEmptyBlock} from '../../util';
import type {BulletedListElement, ChecklistListElement, ListItemElement as ListItemNode, NumberedListElement} from '../../types';

const listClass = rule({
  m: '0 0 16px',
  pl: '24px',
});

const checklistClass = rule({
  m: '0 0 16px',
  pl: '24px',
  listStyle: 'none',
});

const itemClass = rule({
  pos: 'relative',
  m: '0 0 11px',
  lh: '1.7',
});

const checklistItemClass = rule({
  pos: 'relative',
  m: '0 0 11px',
  lh: '1.7',
  listStyle: 'none',
});

const checkboxWrapClass = rule({
  pos: 'absolute',
  l: '-24px',
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
  }
});

const checklistContentClass = rule({
  d: 'block',
  minW: '0',
});

export interface ListContainerElementProps extends RenderElementProps {
  element: BulletedListElement | NumberedListElement | ChecklistListElement;
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
  if (element.type === 'ol') {
    return (
      <ol
        {...attributes}
        className={listClass}
        style={{paddingLeft: '26px'}}
      >
        {children}
      </ol>
    );
  }
  return (
    <ul {...attributes} className={listClass}>
      {children}
    </ul>
  );
};

export const ListItemElement: React.FC<ListItemElementProps> = ({attributes, children, element}) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const styles = useStyles();

  const isChecklistItem = React.useMemo(() => {
    try {
      const path = ReactEditor.findPath(editor, element);
      const [parent] = Editor.parent(editor, path);
      return SlateElement.isElement(parent) && parent.type === 'checklist';
    } catch {
      return false;
    }
  }, [editor, element]);

  const onToggle = React.useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (readOnly || !isChecklistItem) return;
      const path = ReactEditor.findPath(editor, element);
      setChecklistItemChecked(editor, path, !element.checked);
    },
    [editor, element, isChecklistItem, readOnly],
  );

  if (!isChecklistItem) {
    return (
      <li {...attributes} className={itemClass} style={{textAlign: element.align}}>
        {children}
        {isEmptyBlock(element) && <BlockPlaceholder element={element} />}
      </li>
    );
  }

  return (
    <li {...attributes} className={checklistItemClass} style={{textAlign: element.align}}>
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