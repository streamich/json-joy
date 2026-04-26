import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Spoiler} from './Spoiler';
import {type CodeSyntaxDecoration} from '../../behavior/code-highlighting';
import type {RenderLeafProps} from 'slate-react';
import type {CustomText} from '../../types';

const linkClass = rule({
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '4px',
  textDecorationColor: 'rgb(from currentColor r g b / 0.2)',
  '&:hover': {
    textDecorationColor: 'currentColor',
  },
});

export interface LeafProps extends RenderLeafProps {
  leaf: CustomText & CodeSyntaxDecoration;
}

export const Leaf: React.FC<LeafProps> = ({attributes, children, leaf}) => {
  const styles = useStyles();
  const tokenClassName = leaf.codeTokenTypes?.length ? 'token ' + leaf.codeTokenTypes.join(' ') : undefined;
  let content = children;


  if (leaf.bold) content = <strong style={{fontWeight: 700}}>{content}</strong>;
  if (leaf.italic) content = <em>{content}</em>;
  if (leaf.underline) content = <u style={{textUnderlineOffset: '3px'}}>{content}</u>;
  if (leaf.overline) content = <span style={{textDecoration: 'overline'}}>{content}</span>;
  if (leaf.strikethrough) content = <span style={{textDecoration: 'line-through'}}>{content}</span>;
  if (leaf.mark) content = <mark>{content}</mark>;
  if (leaf.spoiler) content = <Spoiler>{content}</Spoiler>
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

  if (leaf.a?.href) {
    return (
      <a
        {...attributes}
        className={linkClass}
        href={leaf.a.href}
        target="_blank"
        rel="noreferrer noopener"
        title={leaf.a.title || leaf.a.href}
        onClick={(event) => {
          if (!(event.metaKey || event.ctrlKey)) event.preventDefault();
        }}
      >
        {content}
      </a>
    );
  }

  return <span {...attributes} className={tokenClassName}>{content}</span>;
};