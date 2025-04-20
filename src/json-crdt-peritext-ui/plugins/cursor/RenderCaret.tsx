import * as React from 'react';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {keyframes, rule} from 'nano-theme';
import {usePeritext} from '../../web/react/context';
import {useSyncStore, useSyncStoreOpt} from '../../web/react/hooks';
import {DefaultRendererColors} from './constants';
import {CommonSliceType} from '../../../json-crdt-extensions';
import {useCursorPlugin} from './context';
import {CaretScore} from '../../components/CaretScore';
import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import type {CaretViewProps} from '../../web/react/cursor/CaretView';

const height = 1.5;
const ms = 350;

const moveAnimation = keyframes({
  from: {
    tr: 'scale(1.2)',
  },
  to: {
    tr: 'scale(1)',
  },
});

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'bottom',
});

const innerClass = rule({
  pos: 'absolute',
  b: '-.18em',
  l: '-.065em',
  w: 'calc(max(.2em, 2px))',
  h: `${height}em`,
  bg: DefaultRendererColors.ActiveCursor,
  bdl: `1px dotted ${DefaultRendererColors.InactiveCursor}`,
  bdrad: '0.0625em',
  'mix-blend-mode': 'multiply',
  an: moveAnimation + ' .25s ease-out forwards',
});

const innerClass2 = rule({
  'mix-blend-mode': 'hard-light',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, point, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;
  const plugin = useCursorPlugin();
  const ref = React.useRef<HTMLSpanElement>(null);

  // Place caret at the end of line wrap.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = el.style;
    style.top = '0px';
    style.left = '0px';
    if (point.anchor === Anchor.After) {
      if (point.isAbs()) return;
      const rect = ctx.dom.getCharRect(point.id);
      if (!rect) return;
      const nextPoint = point.copy((p) => p.refBefore());
      if (nextPoint.isAbs()) return;
      const rect2 = ctx.dom.getCharRect(nextPoint.id);
      if (!rect2) return;
      if (rect.x > rect2.x) {
        const dx = rect.x + rect.width - rect2.x;
        const dy = rect.y - rect2.y;
        style.top = dy + 'px';
        style.left = dx + 'px';
      }
    }
  }, [point, ctx.dom.getCharRect]);

  const anchorForward = point.anchor === Anchor.Before;

  const score = plugin.score.value;
  const delta = plugin.scoreDelta.value;

  const style: React.CSSProperties = {
    background: !focus
      ? DefaultRendererColors.InactiveCursor
      : show
        ? DefaultRendererColors.ActiveCursor
        : 'transparent',
  };

  if (italic || pending?.has(CommonSliceType.i)) {
    style.rotate = '11deg';
  }

  if (anchorForward) {
    style.borderLeft = 0;
    style.borderRight = `1px dotted ${DefaultRendererColors.InactiveCursor}`;
  }

  return (
    <span ref={ref} className={blockClass}>
      {children}
      {score !== plugin.lastVisScore.value && (
        <CaretScore
          score={score}
          delta={delta}
          onRender={() => {
            plugin.lastVisScore.value = score;
          }}
        />
      )}

      {/* Two carets overlay, so that they look good, both, on white and black backgrounds. */}
      <span className={innerClass + innerClass2} style={style} />
      <span className={innerClass} style={style} />
    </span>
  );
};
