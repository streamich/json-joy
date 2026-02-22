import {keyframes, rule} from 'nano-theme';

export const fadeOutScaleAnimation = keyframes({
  to: {
    op: 0,
    tr: 'scale(.95)',
  },
});

export const fadeOutScaleClass = rule({
  an: fadeOutScaleAnimation + ' .25s ease-out',
  animationFillMode: 'forwards',
});
