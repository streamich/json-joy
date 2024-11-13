import * as React from 'react';
import useHarmonicIntervalFn from 'react-use/lib/useHarmonicIntervalFn';
import {keyframes, rule} from 'nano-theme';
import {usePeritext} from '../../react/context';
import {useSyncStore} from '../../react/hooks';
import {DefaultRendererColors} from './constants';
import {CommonSliceType} from '../../../json-crdt-extensions';
import {useCursorPlugin} from './context';
import {CaretScore} from '../../components/CaretScore';
import type {CaretViewProps} from '../../react/cursor/CaretView';

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

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({italic, children}) => {
  const ctx = usePeritext();
  const pending = useSyncStore(ctx.peritext.editor.pending);
  const [show, setShow] = React.useState(true);
  useHarmonicIntervalFn(() => setShow(Date.now() % (ms + ms) > ms), ms);
  const {dom} = usePeritext();
  const focus = useSyncStore(dom.cursor.focus);
  const plugin = useCursorPlugin();

  const score = plugin.score.value;
  const delta = plugin.scoreDelta.value;

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
      <span className={innerClass} style={style} />
    </span>
  );
};
