import * as React from 'react';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {keyframes, rule} from 'nano-theme';
import {usePeritext} from '../../react/context';
import {useSyncStore, useSyncStoreOpt} from '../../react/hooks';
import type {CaretViewProps} from '../../react/cursor/CaretView';
import {DefaultRendererColors} from './constants';
import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
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
  w: 'calc(max(.2em, 3px))',
  h: '1.5em',
  bg: DefaultRendererColors.ActiveCursor,
  bdl: `1px dotted ${DefaultRendererColors.InactiveCursor}`,
  bdrad: '0.0625em',
  'mix-blend-mode': 'multiply',
  an: moveAnimation + ' .25s ease-out forwards',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;
  const plugin = usePlugin();

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

  return (
    <span className={blockClass}>
      {score !== plugin.lastVisScore.value && <CaretScore score={score} delta={delta} />}
      <span className={innerClass} style={style}>
        {children}
      </span>
    </span>
  );
};

const scoreAnimation = keyframes({
  from: {
    op: 0.7,
    tr: 'scale(1.2)',
  },
  to: {
    op: 0,
    tr: 'scale(.7)',
    vis: 'hidden',
  },
});

const shakingAnimation = keyframes({
  '0%': {tr: 'translateX(0), scale(1.2)', op: 1},
  '10%': {tr: 'translateX(-2px)'},
  '20%': {tr: 'translateX(2px)'},
  '30%': {tr: 'translateX(-1px)'},
  '40%': {tr: 'translateX(1px)'},
  '50%': {tr: 'translateX(0), scale(1)'},
  '100%': {op: 0, vis: 'hidden'},
});

const scoreClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  b: '0.3em',
  l: '.75em',
  fz: '.4em',
  op: 0.5,
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
  op: 0.5,
  col: 'blue',
  an: scoreAnimation + ' .3s ease-out forwards',
  pe: 'none',
  us: 'none',
});

interface CaretScoreProps {
  score: number;
  delta: number;
}

const CaretScore: React.FC<CaretScoreProps> = React.memo(({score, delta}) => {
  const plugin = usePlugin();

  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  React.useEffect(() => {
    plugin.lastVisScore.value = score;
  }, []);

  const scoreMsg =
    score > 100 && score <= 120
      ? 'Typing Spree!'
      : score > 200 && score <= 208
        ? 'Go, go, go!'
        : score > 300 && score <= 320
          ? 'Rampage!'
          : score > 400 && score <= 408
            ? "Let's go!"
            : score > 500 && score <= 520
              ? 'Unstoppable!'
              : score > 600 && score <= 608
                ? 'Good stuff!'
                : score > 700 && score <= 708
                  ? 'Alright, alright!'
                  : score > 1000 && score <= 1030
                    ? 'Godlike!'
                    : score > 1500 && score <= 1530
                      ? 'Bingo, bango, bongo!'
                      : score > 2000 && score <= 2030
                        ? 'Legendary!'
                        : score > 3000 && score <= 3040
                          ? 'Beyond Godlike!'
                          : score > 5000 && score <= 5040
                            ? 'Wicked Sick!'
                            : score > 10000 && score <= 10050
                              ? 'Monster Type!'
                              : score > 20000 && score <= 20050
                                ? 'Ultra Type!'
                                : score > 50000 && score <= 50100
                                  ? 'M-M-M-Monster Type!'
                                  : score;

  return (
    <>
      {score >= 24 && (
        <span
          contentEditable={false}
          className={scoreClass}
          style={{animation: typeof scoreMsg === 'string' ? shakingAnimation + ' .7s ease-out forwards' : undefined}}
        >
          {scoreMsg}
        </span>
      )}
      {(typeof scoreMsg === 'string' || (score > 42 && delta > 1)) && (
        <span contentEditable={false} className={scoreDeltaClass}>
          +{delta}
        </span>
      )}
    </>
  );
});
