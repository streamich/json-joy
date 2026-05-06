import * as React from 'react';
import {rule} from 'nano-theme';
import {isTouch} from '@jsonjoy.com/ui';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useSelected} from 'slate-react';
import {typeToLabel} from '../../util/typeToLabel';
import {useMuTxt} from '../../context';
import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import type {CustomElement} from '../../types';

const blockPlaceholderClass = rule({
  pos: 'absolute',
  t: '0',
  l: '0',
  pe: 'none',
  us: 'none',
  mr: '0',
  pd: 'inherit',
  lh: 'inherit',
});

export interface BlockPlaceholderProps {
  element: CustomElement;
}

const getPlaceholderText = (element: CustomElement): React.ReactNode => {
  // if (element.type === 'p') return 'Type here or press "/" for options...';
  if (element.type === 'p')
    return (
      <>
        Type here
        {!isTouch && (
          <>
            &nbsp;or double tap <Key>Shift</Key>, <Key>Shift</Key> for menu
          </>
        )}
        ...
      </>
    );
  return typeToLabel(element.type);
};

export const BlockPlaceholder: React.FC<BlockPlaceholderProps> = ({element}) => {
  const mutxt = useMuTxt();
  const focused = mutxt.focused.use();
  const styles = useStyles();
  const isSelected = useSelected();
  const selection = mutxt.selection.use();

  if (selection || !isSelected || !focused) return;

  const isEmpty = mutxt.api.isEmpty();
  if (isEmpty) return;

  const placeholder = getPlaceholderText(element);
  if (!placeholder) return;

  return (
    <span contentEditable={false} className={blockPlaceholderClass} style={{color: styles.g(0.5)}}>
      {placeholder}
    </span>
  );
};
