import * as React from 'react';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {RenderLeafProps} from 'slate-react';
import type {CustomText} from '../../types';

export interface LeafProps extends RenderLeafProps {
  leaf: CustomText;
}

export const Leaf: React.FC<LeafProps> = ({attributes, children, leaf}) => {
  const styles = useStyles();
  let content = children;

  if (leaf.bold) content = <strong style={{fontWeight: 700}}>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u style={{textUnderlineOffset: '3px'}}>{content}</u>;
  if (leaf.code) {
    content = (
      <code
        style={{
          padding: '0.16rem 0.38rem',
          borderRadius: '8px',
          background: styles.light ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
          color: styles.light ? styles.g(0.14) : styles.g(0.94),
          fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
          fontSize: '0.92em',
        }}
      >
        {content}
      </code>
    );
  }

  return <span {...attributes}>{content}</span>;
};