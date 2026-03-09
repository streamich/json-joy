import * as React from 'react';
import {rule} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import useWindowScroll from 'react-use/lib/useWindowScroll';
import {useDebugCtx} from '../context';
import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {useSyncStore} from '../../../react/hooks';
import {CharOverlay, type SetRect} from './CharOverlay';
import type {CaretViewProps} from '../../../react/cursor/CaretView';

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
  const enabled = useSyncStore(ctx.state.enabled);

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
  useWindowSize();
  useWindowScroll();
  const {ctx, state} = useDebugCtx();
  const showCursorInfo = useSyncStore(state.showCursorInfo);
  const leftCharRef = React.useRef<SetRect>(null);
  const rightCharRef = React.useRef<SetRect>(null);
  const leftLineEndCharRef = React.useRef<SetRect>(null);
  const rightLineEndCharRef = React.useRef<SetRect>(null);
  const leftPrevLineEndCharRef = React.useRef<SetRect>(null);
  const rightPrevLineEndCharRef = React.useRef<SetRect>(null);
  const leftNextLineEndCharRef = React.useRef<SetRect>(null);
  const rightNextLineEndCharRef = React.useRef<SetRect>(null);
  const wordSkipLeftCharRef = React.useRef<SetRect>(null);
  const wordSkipRightCharRef = React.useRef<SetRect>(null);
  const prevLineCaretRef = React.useRef<SetRect>(null);
  const nextLineCaretRef = React.useRef<SetRect>(null);

  const anchorLeft = point.anchor === Anchor.After;

  React.useEffect(() => {
    leftCharRef.current?.(ctx!.events.ui?.getPointRect(point, false));
    rightCharRef.current?.(ctx!.events.ui?.getPointRect(point, true));
    const lineInfo = ctx!.events.ui?.getLineInfo(point);
    leftLineEndCharRef.current?.(lineInfo?.[0][1]);
    rightLineEndCharRef.current?.(lineInfo?.[1][1]);
    if (lineInfo) {
      const prevLineInfo = ctx!.events.ui?.getNextLineInfo(lineInfo, -1);
      const nextLineInfo = ctx!.events.ui?.getNextLineInfo(lineInfo);
      leftPrevLineEndCharRef.current?.(prevLineInfo?.[0][1]);
      rightPrevLineEndCharRef.current?.(prevLineInfo?.[1][1]);
      leftNextLineEndCharRef.current?.(nextLineInfo?.[0][1]);
      rightNextLineEndCharRef.current?.(nextLineInfo?.[1][1]);
    }
    const wordJumpLeftPoint = ctx!.peritext.editor.skip(point, -1, 'word');
    if (wordJumpLeftPoint) wordSkipLeftCharRef.current?.(ctx!.events.ui?.getPointRect?.(wordJumpLeftPoint, true));
    const wordJumpRightPoint = ctx!.peritext.editor.skip(point, 1, 'word');
    if (wordJumpRightPoint) wordSkipRightCharRef.current?.(ctx!.events.ui?.getPointRect?.(wordJumpRightPoint, false));
    const pos = ctx!.events.ui?.pointX(point);

    const currLine = ctx!.events.ui?.getLineInfo(point);
    if (pos && currLine) {
      const targetX = pos[0];
      const prevLine = ctx!.events.ui?.getNextLineInfo(currLine, -1);
      const nextLine = ctx!.events.ui?.getNextLineInfo(currLine);
      if (prevLine) {
        const prevLinePoint = ctx!.events.ui?.findPointAtX(targetX, prevLine);
        if (point.anchor === Anchor.Before) prevLinePoint?.refBefore();
        else prevLinePoint?.refAfter();
        if (prevLinePoint) {
          const rect = ctx!.events.ui?.api.getCharRect?.(prevLinePoint.id);
          if (rect) prevLineCaretRef.current?.(rect);
        }
      }
      if (nextLine) {
        const prevLinePoint = ctx!.events.ui?.findPointAtX(targetX, nextLine);
        if (point.anchor === Anchor.Before) prevLinePoint?.refBefore();
        else prevLinePoint?.refAfter();
        if (prevLinePoint) {
          const rect = ctx!.events.ui?.api.getCharRect?.(prevLinePoint.id);
          if (rect) nextLineCaretRef.current?.(rect);
        }
      }
    }
  });

  if (!showCursorInfo) return null;

  return (
    <>
      <CharOverlay
        rectRef={leftCharRef}
        style={{
          ...characterOverlayStyles,
          backgroundColor: anchorLeft ? 'rgba(0,0,255,.2)' : 'rgba(0,0,255,.1)',
          outlineStyle: anchorLeft ? 'solid' : 'dashed',
        }}
      />
      <CharOverlay
        rectRef={rightCharRef}
        style={{
          ...characterOverlayStyles,
          backgroundColor: !anchorLeft ? 'rgba(0,0,255,.2)' : 'rgba(0,0,255,.1)',
          outlineStyle: !anchorLeft ? 'solid' : 'dashed',
        }}
      />
      <CharOverlay rectRef={leftLineEndCharRef} style={{...eolCharacterOverlayStyles, borderLeft: '2px solid blue'}} />
      <CharOverlay
        rectRef={rightLineEndCharRef}
        style={{...eolCharacterOverlayStyles, borderRight: '2px solid blue'}}
      />
      <CharOverlay
        rectRef={leftPrevLineEndCharRef}
        style={{...eolCharacterOverlayStyles, borderLeft: '2px solid rgba(127,127,127,.5)'}}
      />
      <CharOverlay
        rectRef={rightPrevLineEndCharRef}
        style={{...eolCharacterOverlayStyles, borderRight: '2px solid rgba(127,127,127,.5)'}}
      />
      <CharOverlay
        rectRef={leftNextLineEndCharRef}
        style={{...eolCharacterOverlayStyles, borderLeft: '2px solid rgba(127,127,127,.5)'}}
      />
      <CharOverlay
        rectRef={rightNextLineEndCharRef}
        style={{...eolCharacterOverlayStyles, borderRight: '2px solid rgba(127,127,127,.5)'}}
      />
      <CharOverlay
        rectRef={wordSkipLeftCharRef}
        style={{...eowCharacterOverlayStyles, borderLeft: '2px dotted rgba(127,127,127,.7)'}}
      />
      <CharOverlay
        rectRef={wordSkipRightCharRef}
        style={{...eowCharacterOverlayStyles, borderRight: '2px dotted rgba(127,127,127,.7)'}}
      />
      <CharOverlay
        rectRef={prevLineCaretRef}
        style={{...eowCharacterOverlayStyles, backgroundColor: 'rgba(127,127,127,.2)'}}
      />
      <CharOverlay
        rectRef={nextLineCaretRef}
        style={{...eowCharacterOverlayStyles, backgroundColor: 'rgba(127,127,127,.2)'}}
      />
    </>
  );
};
