import * as React from 'react';
import {keyframes, rule} from 'nano-theme';

const scoreAnimation = keyframes({
  from: {
    op: 0.8,
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
  ff: 'Inter, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  pos: 'absolute',
  b: '0.9em',
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
  b: '1.3em',
  l: '1.2em',
  fz: '.5em',
  fw: 'bold',
  op: 0.5,
  col: '#07f',
  an: scoreAnimation + ' .3s ease-out forwards',
  pe: 'none',
  us: 'none',
});

export interface CaretScoreProps {
  score: number;
  delta: number;
  onRender?: () => void;
}

export const CaretScore: React.FC<CaretScoreProps> = React.memo(({score, delta, onRender}) => {
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  React.useEffect(() => {
    onRender?.();
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
