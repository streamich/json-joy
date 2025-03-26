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
  top: -100,
  left: -100,
  width: 0,
  height: 0,
  backgroundColor: 'rgba(0, 0, 255, 0.1)',
  outline: '1px dashed blue',
};

const DebugOverlay: React.FC<RenderCaretProps> = ({point}) => {
  useWindowSize();
  useWindowScroll();
  const {ctx} = useDebugCtx();
  const leftCharRef = React.useRef<HTMLSpanElement | null>(null);
  const rightCharRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const leftCharRect = ctx!.dom!.getCharRect(point, false);
    const leftCharSpan = leftCharRef.current;
    if (leftCharRect && leftCharSpan) {
      leftCharSpan.style.top = leftCharRect.y + 'px';
      leftCharSpan.style.left = leftCharRect.x + 'px';
      leftCharSpan.style.width = leftCharRect.width + 'px';
      leftCharSpan.style.height = leftCharRect.height + 'px';
    } 
    const rightCharRect = ctx!.dom!.getCharRect(point, true);
    const rightCharSpan = rightCharRef.current;
    if (rightCharRect && rightCharSpan) {
      rightCharSpan.style.top = rightCharRect.y + 'px';
      rightCharSpan.style.left = rightCharRect.x + 'px';
      rightCharSpan.style.width = rightCharRect.width + 'px';
      rightCharSpan.style.height = rightCharRect.height + 'px';
    }
  });

  return (
    <>
      {/* Render outline around the previous character before the caret. */}
      <span ref={leftCharRef} style={characterOverlayStyles} />

      {/* Render outline around the next character after the caret. */}
      <span ref={rightCharRef} style={characterOverlayStyles} />
    </>
  );
};
