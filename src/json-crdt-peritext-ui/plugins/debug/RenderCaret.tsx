import * as React from 'react';
import {rule} from 'nano-theme';
import {useDebugCtx} from './context';
import useWindowSize from 'react-use/lib/useWindowSize';
import useWindowScroll from 'react-use/lib/useWindowScroll';
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
  const {enabled, ctx} = useDebugCtx();

  if (!enabled || !ctx?.dom) return children;

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

const DebugOverlay: React.FC<RenderCaretProps> = ({point}) => {
  useWindowSize();
  useWindowScroll();
  const {ctx} = useDebugCtx();
  const leftCharRef = React.useRef<HTMLSpanElement | null>(null);
  const rightCharRef = React.useRef<HTMLSpanElement | null>(null);
  const rightLineEndCharRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const leftCharSpan = leftCharRef.current;
    if (leftCharSpan) {
      const leftCharRect = ctx!.dom!.getCharRect(point, false);
      if (leftCharRect) {
        leftCharSpan.style.top = leftCharRect.y + 'px';
        leftCharSpan.style.left = leftCharRect.x + 'px';
        leftCharSpan.style.width = leftCharRect.width + 'px';
        leftCharSpan.style.height = leftCharRect.height + 'px';
        leftCharSpan.style.visibility = 'visible';
      } else {
        leftCharSpan.style.visibility = 'hidden';
      }
    } 
    const rightCharSpan = rightCharRef.current;
    if (rightCharSpan) {
      const rightCharRect = ctx!.dom!.getCharRect(point, true);
      if (rightCharRect) {
        rightCharSpan.style.top = rightCharRect.y + 'px';
        rightCharSpan.style.left = rightCharRect.x + 'px';
        rightCharSpan.style.width = rightCharRect.width + 'px';
        rightCharSpan.style.height = rightCharRect.height + 'px';
        rightCharSpan.style.visibility = 'visible';
      } else {
        rightCharSpan.style.visibility = 'hidden';
      }
    }
    const rightLineEndCharSpan = rightLineEndCharRef.current;
    if (rightLineEndCharSpan) {
      const lineEnd = ctx!.dom!.getLineEnd(point);
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
  });

  return (
    <>
      {/* Render outline around the previous character before the caret. */}
      <span ref={leftCharRef} style={characterOverlayStyles} />

      {/* Render outline around the next character after the caret. */}
      <span ref={rightCharRef} style={characterOverlayStyles} />

      {/* Render outline around the end of the line. */}
      <span ref={rightLineEndCharRef} style={{...eolCharacterOverlayStyles, borderRight: '2px solid blue'}} />
    </>
  );
};
