import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from './context';
import useWindowSize from 'react-use/lib/useWindowSize';
import useWindowScroll from 'react-use/lib/useWindowScroll';
import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import {useSyncStore} from '../../react/hooks';
import type {CaretViewProps} from '../../react/cursor/CaretView';

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
  useWindowSize();
  useWindowScroll();
  const {ctx} = useDebugCtx();
  const leftCharRef = React.useRef<HTMLSpanElement | null>(null);
  const rightCharRef = React.useRef<HTMLSpanElement | null>(null);
  const leftLineEndCharRef = React.useRef<HTMLSpanElement | null>(null);
  const rightLineEndCharRef = React.useRef<HTMLSpanElement | null>(null);
  const wordSkipLeftCharRef = React.useRef<HTMLSpanElement | null>(null);
  const wordSkipRightCharRef = React.useRef<HTMLSpanElement | null>(null);

  const anchorLeft = point.anchor === Anchor.After;

  React.useEffect(() => {
    const leftCharSpan = leftCharRef.current;
    if (leftCharSpan) {
      const leftCharRect = ctx!.dom!.getCharRect(point, false);
      const style = leftCharSpan.style;
      if (leftCharRect) {
        style.top = leftCharRect.y + 'px';
        style.left = leftCharRect.x + 'px';
        style.width = leftCharRect.width + 'px';
        style.height = leftCharRect.height + 'px';
        style.outlineStyle = anchorLeft ? 'solid' : 'dashed';
        style.backgroundColor = anchorLeft ? 'rgba(0,0,255,.2)' : 'rgba(0,0,255,.1)';
        style.visibility = 'visible';
      } else {
        style.visibility = 'hidden';
      }
    } 
    const rightCharSpan = rightCharRef.current;
    if (rightCharSpan) {
      const rightCharRect = ctx!.dom!.getCharRect(point, true);
      const style = rightCharSpan.style;
      if (rightCharRect) {
        style.top = rightCharRect.y + 'px';
        style.left = rightCharRect.x + 'px';
        style.width = rightCharRect.width + 'px';
        style.height = rightCharRect.height + 'px';
        style.outlineStyle = anchorLeft ? 'dashed' : 'solid';
        style.backgroundColor = anchorLeft ? 'rgba(0,0,255,.1)' : 'rgba(0,0,255,.2)';
        style.visibility = 'visible';
      } else {
        style.visibility = 'hidden';
      }
    }
    const rightLineEndCharSpan = rightLineEndCharRef.current;
    if (rightLineEndCharSpan) {
      const lineEnd = ctx!.events.ui?.getLineEnd(point, true);
      if (lineEnd) {
        const [, rect] = lineEnd;
        rightLineEndCharSpan.style.top = rect.y + 'px';
        rightLineEndCharSpan.style.left = rect.x + 'px';
        rightLineEndCharSpan.style.width = rect.width + 'px';
        rightLineEndCharSpan.style.height = rect.height + 'px';
        rightLineEndCharSpan.style.visibility = 'visible';
      } else {
        rightLineEndCharSpan.style.visibility = 'hidden';
      }
    }
    const leftLineEndCharSpan = leftLineEndCharRef.current;
    if (leftLineEndCharSpan) {
      const lineEnd = ctx!.events.ui?.getLineEnd(point, false);
      if (lineEnd) {
        const [, rect] = lineEnd;
        leftLineEndCharSpan.style.top = rect.y + 'px';
        leftLineEndCharSpan.style.left = rect.x + 'px';
        leftLineEndCharSpan.style.width = rect.width + 'px';
        leftLineEndCharSpan.style.height = rect.height + 'px';
        leftLineEndCharSpan.style.visibility = 'visible';
      } else {
        leftLineEndCharSpan.style.visibility = 'hidden';
      }
    }
    const wordSkipRightCharSpan = wordSkipRightCharRef.current;
    if (wordSkipRightCharSpan) {
      const wordJumpRightPoint = ctx!.peritext.editor.skip(point, 1, 'word');
      if (wordJumpRightPoint) {
        const rect = ctx!.events.ui?.api?.getCharRect?.(wordJumpRightPoint, false);
        const style = wordSkipRightCharSpan.style;
        if (rect) {
          style.top = rect.y + 'px';
          style.left = rect.x + 'px';
          style.width = rect.width + 'px';
          style.height = rect.height + 'px';
          style.outlineStyle = anchorLeft ? 'dashed' : 'solid';
          style.visibility = 'visible';
        } else {
          style.visibility = 'hidden';
        }
      }
    }
    const wordSkipLeftCharSpan = wordSkipLeftCharRef.current;
    if (wordSkipLeftCharSpan) {
      const wordJumpLeftPoint = ctx!.peritext.editor.skip(point, -1, 'word');
      if (wordJumpLeftPoint) {
        const rect = ctx!.events.ui?.api?.getCharRect?.(wordJumpLeftPoint, true);
        const style = wordSkipLeftCharSpan.style;
        if (rect) {
          style.top = rect.y + 'px';
          style.left = rect.x + 'px';
          style.width = rect.width + 'px';
          style.height = rect.height + 'px';
          style.outlineStyle = anchorLeft ? 'dashed' : 'solid';
          style.visibility = 'visible';
        } else {
          style.visibility = 'hidden';
        }
      }
    }
  });

  return (
    <>
      {/* Render outline around the previous character before the caret. */}
      <span ref={leftCharRef} style={characterOverlayStyles} />

      {/* Render outline around the next character after the caret. */}
      <span ref={rightCharRef} style={characterOverlayStyles} />

      {/* Render outline around the beginning of the line. */}
      <span ref={leftLineEndCharRef} style={{...eolCharacterOverlayStyles, borderLeft: '2px solid blue'}} />

      {/* Render outline around the end of the line. */}
      <span ref={rightLineEndCharRef} style={{...eolCharacterOverlayStyles, borderRight: '2px solid blue'}} />
      
      <span ref={wordSkipLeftCharRef} style={{...eowCharacterOverlayStyles, borderLeft: '2px dotted rgba(127,127,127,.7)'}} />
      <span ref={wordSkipRightCharRef} style={{...eowCharacterOverlayStyles, borderRight: '2px dotted rgba(127,127,127,.7)'}} />
    </>
  );
};
