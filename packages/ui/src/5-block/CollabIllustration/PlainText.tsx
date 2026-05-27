import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderParagraph} from '../../3-list-item/Placeholder/PlaceholderParagraph';
import {PlaceholderWords} from '../../3-list-item/Placeholder/PlaceholderWords';
import {PlaceholderSelection} from '../../3-list-item/Placeholder/PlaceholderSelection';
import {PlaceholderCaret} from '../../3-list-item/Placeholder/PlaceholderCaret';
import {PlaceholderCursor} from '../../3-list-item/Placeholder/PlaceholderCursor';
import {Floater} from '../../misc/Floater';
import {CollabAvatars} from './CollabAvatars';
import {LEO, MARK} from './users';

const wrapClass = rule({
  pos: 'relative',
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  pd: '24px 28px',
  ff: 'system-ui, -apple-system, sans-serif',
  fz: '14px',
  lh: '24px',
});

const cursorClass = rule({
  pos: 'absolute',
});

const caretHeight = '18px';
const wordHeight = 11;
const minW = 22;
const maxW = 80;

export interface CollabIllustrationPlainTextProps {
  style?: React.CSSProperties;
}

export const CollabIllustrationPlainText: React.FC<CollabIllustrationPlainTextProps> = ({style}) => (
  <span className={wrapClass} style={style}>
    <span style={{display: 'block', marginBottom: 16}}>
      <CollabAvatars size={32} />
    </span>

    <PlaceholderParagraph>
      <PlaceholderWords count={14} seed={3} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
      <PlaceholderSelection color={LEO.color}>
        <PlaceholderWords count={4} seed={17} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        <PlaceholderCaret name={LEO.name} color={LEO.color} height={caretHeight} />
      </PlaceholderSelection>{' '}
      <PlaceholderWords count={15} seed={29} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
      <PlaceholderSelection color={MARK.color}>
        <PlaceholderWords count={4} seed={37} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        <PlaceholderCaret name={MARK.name} color={MARK.color} placement="tl" height={caretHeight} />
      </PlaceholderSelection>{' '}
      <PlaceholderWords count={12} seed={43} minWidth={minW} maxWidth={maxW} height={wordHeight} />
    </PlaceholderParagraph>

    <span className={cursorClass} style={{top: 8, right: 100}}>
      <Floater distance={22} duration={8} delay={0}>
        <PlaceholderCursor name={LEO.name} color={LEO.color} size={20} />
      </Floater>
    </span>

    <span className={cursorClass} style={{bottom: 10, left: 100}}>
      <Floater distance={33} duration={11} delay={-2.5}>
        <PlaceholderCursor name={MARK.name} color={MARK.color} size={20} />
      </Floater>
    </span>
  </span>
);
