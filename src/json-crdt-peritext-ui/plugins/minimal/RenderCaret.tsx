import * as React from 'react';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {keyframes, rule} from 'nano-theme';
import {usePeritext} from '../../react/context';
import {useSyncStore} from '../../react/hooks';
import type {CaretViewProps} from '../../react/selection/CaretView';
import {DefaultRendererColors} from './constants';
import {CommonSliceType} from '../../../json-crdt-extensions';
import {usePlugin} from './context';

const ms = 350;

const moveAnimation = keyframes({
  from: {
    tr: 'scale(1.2)',
  },
  to: {
    tr: 'scale(1)',
  },
});

const scoreAnimation = keyframes({
  from: {
    op: .7,
    tr: 'scale(1.2)',
  },
  to: {
    op: 0,
    tr: 'scale(.7)',
    vis: 'hidden',
  },
});

const shakingAnimation = keyframes({
  '0%': { tr: 'translateX(0), scale(1.2)', op: 1 },
  '10%': { tr: 'translateX(-2px)' },
  '20%': { tr: 'translateX(2px)' },
  '30%': { tr: 'translateX(-1px)' },
  '40%': { tr: 'translateX(1px)' },
  '50%': { tr: 'translateX(0), scale(1)' },
  '100%': { op: 0, vis: 'hidden' },
});

const blockClass = rule({
  pos: 'relative',
  d: 'inline-block',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'center',
});

const innerClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  b: '-0.4em',
  l: '-0.065em',
  w: `calc(max(.2em, 3px))`,
  h: '1.5em',
  bg: DefaultRendererColors.ActiveCursor,
  bdl: `1px dotted ${DefaultRendererColors.InactiveCursor}`,
  bdrad: '0.0625em',
  'mix-blend-mode': 'multiply',
  an: moveAnimation + ' .25s ease-out forwards',
});

const scoreClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  b: '0.3em',
  l: '.75em',
  fz: '.4em',
  op: .5,
  an: scoreAnimation + ' .5s ease-out forwards',
  ws: 'nowrap',
  pe: 'none',
  us: 'none',
});

const scoreDeltaClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  b: '0.9em',
  l: '1.2em',
  fz: '.5em',
  op: .5,
  col: 'blue',
  an: scoreAnimation + ' .3s ease-out forwards',
  pe: 'none',
  us: 'none',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const {score, scoreDelta} = usePlugin();
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const {dom} = usePeritext();
  const focus = useSyncStore(dom.cursor.focus);

  const style: React.CSSProperties = {
    background: !focus
      ? DefaultRendererColors.InactiveCursor
      : show
        ? DefaultRendererColors.ActiveCursor
        : 'transparent',
  };

  if (italic || pending.has(CommonSliceType.i)) {
    style.rotate = '11deg';
  }

  const s = score.value;
  const d = scoreDelta.value;
  const scoreMsg = s > 100 && s <= 120
    ? 'Killing Spree!'
      : s > 300 && s <= 320
        ? 'Rampage!'
        : s > 500 && s <= 520
          ? 'Unstoppable!'
          : s > 1000 && s <= 1030
            ? 'Godlike!'
            : s > 2000 && s <= 2030
              ? 'Legendary!'
              : s > 3000 && s <= 3040
                ? 'Beyond Godlike!'
                : s > 5000 && s <= 5040
                  ? 'Wicked Sick!'
                  : s > 10000 && s <= 10050
                    ? 'Monster Kill!'
                    : s > 20000 && s <= 20050
                      ? 'Ultra Kill!'
                      : s > 50000 && s <= 50100
                        ? 'M-M-M-Monster Kill!'
                        : s;

  return (
    <span className={blockClass}>
      {s >=24 && <span contentEditable={false} className={scoreClass} style={{animation: typeof scoreMsg === 'string' ? shakingAnimation + ' .7s ease-out forwards' : undefined}}>{scoreMsg}</span>}
      {(typeof scoreMsg === 'string' || (s > 42 && d > 1)) && <span contentEditable={false} className={scoreDeltaClass}>+{d}</span>}
      <span className={innerClass} style={style}>
        {children}
      </span>
    </span>
  );
};
