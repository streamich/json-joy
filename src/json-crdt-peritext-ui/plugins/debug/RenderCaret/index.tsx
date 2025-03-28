import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from '../context';
import {Anchor} from '../../../../json-crdt-extensions/peritext/rga/constants';
import {useSyncStore} from '../../../react/hooks';
import type {CaretViewProps} from '../../../react/cursor/CaretView';
import {CharOverlay, SetRect} from './CharOverlay';

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  va: 'bottom',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = (props) => {
  const {children} = props;
  const ctx = useDebugCtx();
  const enabled = useSyncStore(ctx.enabled);

  if (!enabled || !ctx.ctx?.dom) return children;

  return <RenderDebugCaret {...props} />;
};

const RenderDebugCaret: React.FC<RenderCaretProps> = (props) => {
  return (
    <span className={blockClass}>
      {props.children}
      <DebugOverlay {...props} />
    </span>
  );
};

const characterOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  display: 'inline-block',
  visibility: 'hidden',
  backgroundColor: 'rgba(0, 0, 255, 0.1)',
  outline: '1px dashed blue',
};

const eolCharacterOverlayStyles: React.CSSProperties = {
  ...characterOverlayStyles,
  outline: '1px dotted blue',
};

const eowCharacterOverlayStyles: React.CSSProperties = {
  ...characterOverlayStyles,
  backgroundColor: 'rgba(127,127,127,.1)',
  outline: '0',
};

const DebugOverlay: React.FC<RenderCaretProps> = ({point}) => {
  const {ctx} = useDebugCtx();
  const leftCharRef = React.useRef<SetRect>(null);
  const rightCharRef = React.useRef<SetRect>(null);
  const leftLineEndCharRef = React.useRef<SetRect>(null);
  const rightLineEndCharRef = React.useRef<SetRect>(null);
  const wordSkipLeftCharRef = React.useRef<SetRect>(null);
  const wordSkipRightCharRef = React.useRef<SetRect>(null);

  const anchorLeft = point.anchor === Anchor.After;

  React.useEffect(() => {
    leftCharRef.current?.(ctx!.dom!.getCharRect(point, false));
    rightCharRef.current?.(ctx!.dom!.getCharRect(point, true));
    const lineInfo = ctx!.events.ui?.getLineInfo(point);
    leftLineEndCharRef.current?.(lineInfo?.[0][1]);
    rightLineEndCharRef.current?.(lineInfo?.[1][1]);
    const wordJumpLeftPoint = ctx!.peritext.editor.skip(point, -1, 'word');
    if (wordJumpLeftPoint)
      wordSkipLeftCharRef.current?.(ctx!.events.ui?.api?.getCharRect?.(wordJumpLeftPoint, true));
    const wordJumpRightPoint = ctx!.peritext.editor.skip(point, 1, 'word');
    if (wordJumpRightPoint)
      wordSkipRightCharRef.current?.(ctx!.events.ui?.api?.getCharRect?.(wordJumpRightPoint, false));
  });

  return (
    <>
      <CharOverlay rectRef={leftCharRef} style={{
        ...characterOverlayStyles,
        backgroundColor: anchorLeft ? 'rgba(0,0,255,.2)' : 'rgba(0,0,255,.1)',
        outlineStyle: anchorLeft ? 'solid' : 'dashed',
      }} />
      <CharOverlay rectRef={rightCharRef} style={{
        ...characterOverlayStyles,
        backgroundColor: !anchorLeft ? 'rgba(0,0,255,.2)' : 'rgba(0,0,255,.1)',
        outlineStyle: !anchorLeft ? 'solid' : 'dashed',
      }} />
      <CharOverlay rectRef={leftLineEndCharRef} style={{...eolCharacterOverlayStyles, borderLeft: '2px solid blue'}} />
      <CharOverlay rectRef={rightLineEndCharRef} style={{...eolCharacterOverlayStyles, borderRight: '2px solid blue'}} />
      <CharOverlay rectRef={wordSkipLeftCharRef} style={{...eowCharacterOverlayStyles, borderLeft: '2px dotted rgba(127,127,127,.7)'}} />
      <CharOverlay rectRef={wordSkipRightCharRef} style={{...eowCharacterOverlayStyles, borderRight: '2px dotted rgba(127,127,127,.7)'}} />
    </>
  );
};
