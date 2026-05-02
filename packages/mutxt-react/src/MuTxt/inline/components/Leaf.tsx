import * as React from 'react';
import {useMemo} from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import {Spoiler} from './Spoiler';
import type {RenderLeafProps} from 'slate-react';
import type {CustomText} from '../../types';
import {useTrace} from '@jsonjoy.com/ui';

const linkClass = rule({
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '4px',
  textDecorationColor: 'rgb(from currentColor r g b / 0.2)',
  '&:hover': {
    textDecorationColor: 'currentColor',
  },
});

const insClass = rule({
  bg: 'rgba(152,235,167,.3)',
  bxsh: '0 2px 0 0 rgba(152,225,167,.6)',
  td: 'none',
});

const delClass = rule({
  bg: 'rgba(240,190,190,.4)',
  bxsh: '0 2px 0 0 rgba(255,177,177,.5)',
  col: 'red',
});

const codeClass = rule({
  pd: '.14rem .42rem .22rem',
  bdrad: '.42em',
  ff: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  fz: '.92em',
  fw: 500,
  ls: '-0.01em',
});

export interface LeafProps extends RenderLeafProps {
  leaf: CustomText & {activeSelection?: true};
}

export const Leaf: React.FC<LeafProps> = ({attributes, children, leaf, text}) => {
  const styles = useStyles();
  const isInCodeBlock = !!useTrace('isInCodeBlock');
  const dynamicCodeClass = useMemo(() => {
    return rule({
      bg: styles.g(0, 0.03),
      bd: `1px solid ${styles.g(0, 0.05)}`,
      bxsh: `inset 0 1px 0 ${styles.g(1, 0.16)}, 0 1px 2px ${styles.g(0, 0.06)}`,
      col: styles.g(0.08),
      '&:hover': {
        bg: styles.g(0, 0.04),
        bd: `1px solid ${styles.g(0, 0.16)}`,
        // bxsh: `inset 0 1px 0 ${styles.g(1, 0.44)}, 0 1px 2px ${styles.g(0, 0.06)}`,
        bxsh: `inset 0 1px 0 ${styles.g(1, 0.08)}, 0 1px 2px ${styles.g(0, 0.03)}`,
        col: styles.g(0.02),
      },
    });
  }, [styles, styles.light]);
  const style: React.CSSProperties | undefined = leaf.activeSelection
    ? {backgroundColor: styles.col.accent(0, 'bg-2')}
    : undefined;
  let content = children;

  if (!isInCodeBlock) {
    if (leaf.kbd) content = <Key>{content}</Key>;
  }

  if (leaf.ins) content = <ins className={insClass}>{content}</ins>;
  else if (leaf.del) content = <del className={delClass}>{content}</del>;

  if (!isInCodeBlock) {
    if (leaf.bold) content = <strong style={{fontWeight: 700}}>{content}</strong>;
    if (leaf.italic) content = <em>{content}</em>;
  }

  if (leaf.underline) content = <u style={{textUnderlineOffset: '3px'}}>{content}</u>;
  if (leaf.overline) content = <span style={{textDecoration: 'overline'}}>{content}</span>;
  if (leaf.strikethrough) content = <span style={{textDecoration: 'line-through'}}>{content}</span>;
  if (leaf.mark) content = <mark>{content}</mark>;

  if (!isInCodeBlock) {
    if (leaf.spoiler) content = <Spoiler text={text}>{content}</Spoiler>;
    if (leaf.sup) content = <sup>{content}</sup>;
    else if (leaf.sub) content = <sub>{content}</sub>;
    if (leaf.code) content = <code className={codeClass + dynamicCodeClass}>{content}</code>;
  }

  const href = leaf.a?.href;
  if (href) {
    return (
      <a
        {...attributes}
        className={linkClass}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        title={leaf.a?.title || href}
        style={style}
        onClick={(event) => {
          if (!(event.metaKey || event.ctrlKey)) event.preventDefault();
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <span {...attributes} style={style}>
      {content}
    </span>
  );
};
