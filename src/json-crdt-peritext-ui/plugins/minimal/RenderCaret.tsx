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

export const moveAnimation = keyframes({
  from: {
    tr: 'scale(1.2)',
  },
  to: {
    tr: 'scale(1)',
  },
});

export const scoreAnimation = keyframes({
  from: {
    op: .7,
    tr: 'scale(1.2)',
  },
  to: {
    op: 0,
    tr: 'scale(.7)',
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
  w: `calc(max(.2em, 3px))`,
  h: '1.5em',
  bg: DefaultRendererColors.ActiveCursor,
  bdl: `1px dotted ${DefaultRendererColors.InactiveCursor}`,
  bdrad: '0.0625em',
  'mix-blend-mode': 'multiply',
  an: moveAnimation + ' .25s ease-out',
  animationFillMode: 'forwards',
});

const scoreClass = rule({
  pos: 'absolute',
  d: 'inline-block',
  b: '0.3em',
  l: '.75em',
  fz: '.4em',
  op: .5,
  an: scoreAnimation + ' .5s ease-out',
  animationFillMode: 'forwards',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const {score} = usePlugin();
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

  return (
    <span className={blockClass}>
      {score.value > 9 && <span className={scoreClass}>{score.value}</span>}
      <span className={innerClass} style={style}>
        {children}
      </span>
    </span>
  );
};
