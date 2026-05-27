import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderParagraph} from '../../3-list-item/Placeholder/PlaceholderParagraph';
import {PlaceholderWords} from '../../3-list-item/Placeholder/PlaceholderWords';
import {PlaceholderTitle} from '../../3-list-item/Placeholder/PlaceholderTitle';
import {PlaceholderBlockquote} from '../../3-list-item/Placeholder/PlaceholderBlockquote';
import {PlaceholderSelection} from '../../3-list-item/Placeholder/PlaceholderSelection';
import {PlaceholderCaret} from '../../3-list-item/Placeholder/PlaceholderCaret';
import {PlaceholderCursor} from '../../3-list-item/Placeholder/PlaceholderCursor';
import {CollabAvatars} from './CollabAvatars';
import {LEO, MARK} from './users';

const wrapClass = rule({
  pos: 'relative',
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  pd: '12px 14px',
  ff: 'system-ui, -apple-system, sans-serif',
  fz: '11px',
  lh: '18px',
});

const cursorClass = rule({
  pos: 'absolute',
});

const caretHeight = '13px';
const wordHeight = 8;
const minW = 16;
const maxW = 52;

export interface CollabIllustrationRichTextSmallProps {
  style?: React.CSSProperties;
}

/** Compact rich-text illustration — title, one line, and a one-line blockquote. */
export const CollabIllustrationRichTextSmall: React.FC<CollabIllustrationRichTextSmallProps> = ({style}) => (
  <span className={wrapClass} style={style}>
    <span style={{display: 'block', marginBottom: 10}}>
      <CollabAvatars size={20} />
    </span>

    <span style={{display: 'block', marginBottom: 8}}>
      <PlaceholderTitle level={3} words={1} seed={1} minWidth={70} maxWidth={150} color="rgba(0,0,0,.12)" />
    </span>

    <PlaceholderParagraph style={{marginBottom: 8}}>
      <PlaceholderWords count={2} seed={3} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
      <PlaceholderSelection color={LEO.color}>
        <PlaceholderWords count={2} seed={7} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        <PlaceholderCaret color={LEO.color} height={caretHeight} />
      </PlaceholderSelection>{' '}
      <PlaceholderWords count={1} seed={11} minWidth={minW} maxWidth={maxW} height={wordHeight} />
    </PlaceholderParagraph>

    <PlaceholderBlockquote color="rgba(0,0,0,.24)" thickness={3} indent={10}>
      <PlaceholderParagraph>
        <PlaceholderWords count={1} seed={13} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
        <PlaceholderSelection color={MARK.color}>
          <PlaceholderWords count={2} seed={23} minWidth={minW} maxWidth={maxW} height={wordHeight} />
          <PlaceholderCaret color={MARK.color} placement="tl" height={caretHeight} />
        </PlaceholderSelection>{' '}
        <PlaceholderWords count={1} seed={29} minWidth={minW} maxWidth={maxW} height={wordHeight} />
      </PlaceholderParagraph>
    </PlaceholderBlockquote>

    <span className={cursorClass} style={{top: 8, right: 12}}>
      <PlaceholderCursor color={LEO.color} size={14} />
    </span>

    <span className={cursorClass} style={{bottom: 8, left: 22}}>
      <PlaceholderCursor color={MARK.color} size={14} />
    </span>
  </span>
);
