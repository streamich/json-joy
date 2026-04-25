import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {typeToLabel} from '../../util/typeToLabel';
import {useSelected} from 'slate-react';
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

const getPlaceholderText = (element: CustomElement): string => {
  if (element.type === 'p') return 'Type here or press "/" for options...';
  return typeToLabel(element.type);
};

export const BlockPlaceholder: React.FC<BlockPlaceholderProps> = ({element}) => {
  const styles = useStyles();
  const isSelected = useSelected();
  const placeholderText = getPlaceholderText(element);

  if (!isSelected || !placeholderText) return null;

  return (
    <span contentEditable={false} className={blockPlaceholderClass} style={{color: styles.g(0.5)}}>
      {placeholderText}
    </span>
  );
};
