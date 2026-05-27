import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderParagraph} from '../../3-list-item/Placeholder/PlaceholderParagraph';
import {PlaceholderWords} from '../../3-list-item/Placeholder/PlaceholderWords';
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
const minW = 14;
const maxW = 46;

export interface CollabIllustrationPlainTextSmallProps {
  style?: React.CSSProperties;
}

export const CollabIllustrationPlainTextSmall: React.FC<CollabIllustrationPlainTextSmallProps> = ({style}) => (
  <span className={wrapClass} style={style}>
    <span style={{display: 'block', marginBottom: 10}}>
      <CollabAvatars size={20} />
    </span>

    <PlaceholderParagraph>
      <PlaceholderWords count={3} seed={3} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
      <PlaceholderSelection color={LEO.color}>
        <PlaceholderWords count={2} seed={17} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        <PlaceholderCaret color={LEO.color} height={caretHeight} />
      </PlaceholderSelection>{' '}
      <PlaceholderWords count={3} seed={29} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
      <PlaceholderSelection color={MARK.color}>
        <PlaceholderWords count={2} seed={37} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        <PlaceholderCaret color={MARK.color} placement="tl" height={caretHeight} />
      </PlaceholderSelection>{' '}
      <PlaceholderWords count={2} seed={43} minWidth={minW} maxWidth={maxW} height={wordHeight} />
    </PlaceholderParagraph>

    <span className={cursorClass} style={{top: 6, right: 12}}>
      <PlaceholderCursor color={LEO.color} size={14} />
    </span>

    <span className={cursorClass} style={{bottom: 8, left: 22}}>
      <PlaceholderCursor color={MARK.color} size={14} />
    </span>
  </span>
);
