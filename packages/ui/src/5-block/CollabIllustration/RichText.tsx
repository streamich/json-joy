import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderParagraph} from '../../3-list-item/Placeholder/PlaceholderParagraph';
import {PlaceholderWords} from '../../3-list-item/Placeholder/PlaceholderWords';
import {PlaceholderTitle} from '../../3-list-item/Placeholder/PlaceholderTitle';
import {PlaceholderBlockquote} from '../../3-list-item/Placeholder/PlaceholderBlockquote';
import {PlaceholderUnderline} from '../../3-list-item/Placeholder/PlaceholderUnderline';
import {PlaceholderSelection} from '../../3-list-item/Placeholder/PlaceholderSelection';
import {PlaceholderCaret} from '../../3-list-item/Placeholder/PlaceholderCaret';
import {PlaceholderCursor} from '../../3-list-item/Placeholder/PlaceholderCursor';
import {Floater} from '../../misc/Floater';
import {CollabAvatars} from './CollabAvatars';
import {LEO, MARK} from './users';
import {useStyles} from '../../styles/context';

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

const caretHeight = '20px';
const wordHeight = 12;
const minW = 24;
const maxW = 86;

export interface CollabIllustrationRichTextProps {
  style?: React.CSSProperties;
}

export const CollabIllustrationRichText: React.FC<CollabIllustrationRichTextProps> = ({style}) => {
  const styles = useStyles();

  return (
    <span className={wrapClass} style={style}>
      <span style={{display: 'block', marginBottom: 16}}>
        <CollabAvatars size={32} />
      </span>

      <span style={{display: 'block', marginBottom: 14}}>
        <PlaceholderTitle level={2} words={1} seed={1} minWidth={120} maxWidth={300} color="rgba(0,0,0,.12)" />
      </span>

      <PlaceholderParagraph style={{marginBottom: 12}}>
        <PlaceholderWords count={6} seed={3} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
        <PlaceholderSelection color={LEO.color}>
          <PlaceholderWords count={4} seed={7} minWidth={minW} maxWidth={maxW} height={wordHeight} />
          <PlaceholderCaret name={LEO.name} color={LEO.color} height={caretHeight} />
        </PlaceholderSelection>{' '}
        <PlaceholderWords count={2} seed={11} minWidth={minW} maxWidth={maxW} height={wordHeight} />{' '}
        <PlaceholderUnderline color={styles.grey.fg + ''} variant="dotted">
          <PlaceholderWords count={2} seed={11} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        </PlaceholderUnderline>{' '}
        <PlaceholderWords count={1} seed={11} minWidth={minW} maxWidth={maxW} height={wordHeight} />
      </PlaceholderParagraph>

      <PlaceholderBlockquote color="rgba(0,0,0,.24)" thickness={3}>
        <PlaceholderParagraph>
          <PlaceholderUnderline color={styles.grey.fg + ''} variant="dotted">
            <PlaceholderWords count={3} seed={13} minWidth={minW} maxWidth={maxW} height={wordHeight} />
          </PlaceholderUnderline>{' '}
          <PlaceholderWords count={2} seed={17} minWidth={minW} maxWidth={maxW} height={wordHeight} />{' '}
          <PlaceholderWords count={2} seed={19} minWidth={minW} maxWidth={maxW} height={wordHeight} trailing />
          <PlaceholderSelection color={MARK.color}>
            <PlaceholderWords count={4} seed={23} minWidth={minW} maxWidth={maxW} height={wordHeight} />
            <PlaceholderCaret name={MARK.name} color={MARK.color} placement="tl" height={caretHeight} />
          </PlaceholderSelection>{' '}
          <PlaceholderWords count={3} seed={29} minWidth={minW} maxWidth={maxW} height={wordHeight} />
        </PlaceholderParagraph>
      </PlaceholderBlockquote>

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
};
