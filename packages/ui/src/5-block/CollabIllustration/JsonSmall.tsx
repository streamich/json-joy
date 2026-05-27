import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderRow} from '../../3-list-item/Placeholder/PlaceholderRow';
import {PlaceholderWord} from '../../3-list-item/Placeholder/PlaceholderWord';
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
  pd: '12px 16px',
  ff: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fz: '11px',
  lh: '18px',
});

const cursorClass = rule({
  pos: 'absolute',
});

const punct = (s: string): React.ReactElement => <span style={{opacity: 0.45}}>{s}</span>;

const caretHeight = '13px';
const wordHeight = 8;

export interface CollabIllustrationJsonSmallProps {
  style?: React.CSSProperties;
}

/** Compact JSON illustration — a flat object with two edited values. */
export const CollabIllustrationJsonSmall: React.FC<CollabIllustrationJsonSmallProps> = ({style}) => (
  <span className={wrapClass} style={style}>
    <PlaceholderRow>{punct('{')}</PlaceholderRow>

    <PlaceholderRow indent={1} indentSize={14}>
      <PlaceholderWord width={34} height={wordHeight} />
      {punct(': ')}
      <PlaceholderWord width={62} height={wordHeight} />
      {punct(',')}
    </PlaceholderRow>

    <PlaceholderRow indent={1} indentSize={14}>
      <PlaceholderWord width={28} height={wordHeight} />
      {punct(': ')}
      <PlaceholderSelection color={LEO.color}>
        <PlaceholderWord width={26} height={wordHeight} />
      </PlaceholderSelection>
      {punct(',')}
      <PlaceholderCaret color={LEO.color} height={caretHeight} />
    </PlaceholderRow>

    <PlaceholderRow indent={1} indentSize={14}>
      <PlaceholderWord width={40} height={wordHeight} />
      {punct(': ')}
      <PlaceholderSelection color={MARK.color}>
        <PlaceholderWord width={44} height={wordHeight} />
      </PlaceholderSelection>
      <PlaceholderCaret color={MARK.color} placement="tl" height={caretHeight} />
    </PlaceholderRow>

    <PlaceholderRow>{punct('}')}</PlaceholderRow>

    <span className={cursorClass} style={{top: 8, left: 150}}>
      <PlaceholderCursor color={LEO.color} size={14} />
    </span>

    <span className={cursorClass} style={{bottom: 10, right: 16, display: 'inline-flex'}}>
      <CollabAvatars size={20} />
    </span>
  </span>
);
