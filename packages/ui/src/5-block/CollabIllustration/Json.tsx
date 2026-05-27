import * as React from 'react';
import {rule} from 'nano-theme';
import {PlaceholderRow} from '../../3-list-item/Placeholder/PlaceholderRow';
import {PlaceholderWord} from '../../3-list-item/Placeholder/PlaceholderWord';
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
  pd: '20px 28px',
  ff: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fz: '13px',
  lh: '22px',
});

const cursorClass = rule({
  pos: 'absolute',
});

const punct = (s: string): React.ReactElement => <span style={{opacity: 0.45}}>{s}</span>;

const caretHeight = '18px';

export interface CollabIllustrationJsonProps {
  style?: React.CSSProperties;
}

export const CollabIllustrationJson: React.FC<CollabIllustrationJsonProps> = ({style}) => (
  <span className={wrapClass} style={style}>
    <PlaceholderRow>{punct('{')}</PlaceholderRow>

    <PlaceholderRow indent={1}>
      <PlaceholderWord width={56} />
      {punct(': ')}
      <PlaceholderWord width={110} />
      {punct(',')}
    </PlaceholderRow>

    <PlaceholderRow indent={1}>
      <PlaceholderWord width={44} />
      {punct(': ')}
      <PlaceholderSelection color={LEO.color}>
        <PlaceholderWord width={36} />
      </PlaceholderSelection>
      {punct(',')}
      <PlaceholderCaret name={LEO.name} color={LEO.color} height={caretHeight} />
    </PlaceholderRow>

    <PlaceholderRow indent={1}>
      <PlaceholderWord width={68} />
      {punct(': ')}
      <PlaceholderWord width={30} />
      {punct(',')}
    </PlaceholderRow>

    <PlaceholderRow indent={1}>
      <PlaceholderWord width={52} />
      {punct(': [')}
    </PlaceholderRow>

    <PlaceholderRow indent={2}>{punct('{')}</PlaceholderRow>

    <PlaceholderRow indent={3}>
      <PlaceholderWord width={38} />
      {punct(': ')}
      <PlaceholderWord width={80} />
      {punct(',')}
    </PlaceholderRow>

    <PlaceholderRow indent={3}>
      <PlaceholderWord width={48} />
      {punct(': ')}
      <PlaceholderSelection color={MARK.color}>
        <PlaceholderWord width={64} />
      </PlaceholderSelection>
      <PlaceholderCaret name={MARK.name} color={MARK.color} placement="tl" height={caretHeight} />
    </PlaceholderRow>

    <PlaceholderRow indent={2}>{punct('},')}</PlaceholderRow>
    <PlaceholderRow indent={1}>{punct(']')}</PlaceholderRow>
    <PlaceholderRow>{punct('}')}</PlaceholderRow>

    <span className={cursorClass} style={{top: 10, left: 280}}>
      <Floater distance={16} duration={7} delay={0}>
        <PlaceholderCursor name={LEO.name} color={LEO.color} size={20} />
      </Floater>
    </span>

    <span className={cursorClass} style={{bottom: 16, left: 66}}>
      <Floater distance={22} duration={8} delay={-2.5}>
        <PlaceholderCursor name={MARK.name} color={MARK.color} size={20} />
      </Floater>
    </span>

    <span className={cursorClass} style={{bottom: 16, right: 54, display: 'inline-flex'}}>
      <CollabAvatars size={32} />
    </span>
  </span>
);
