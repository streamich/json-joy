import {keyframes, rule, theme} from 'nano-theme';

/**
 * Attach this class to new resources to highlight the for 1 sec for users.
 */

const color1 = 'rgba(81, 203, 238, 1)';
const color2 = theme.green(1);
const color3 = theme.color.sem.warning[0];

const highlightAnimation = keyframes({
  from: {
    boxShadow: `0 0 1px ${color1}`,
  },
  '25%': {
    boxShadow: `0 0 16px ${color1}`,
  },
  '50%': {
    boxShadow: `0 0 50px ${color2}`,
  },
  '60%': {
    boxShadow: `0 0 20px ${color2}`,
  },
  to: {
    boxShadow: `0 0 0px ${color3}`,
  },
});

export const highlightClass = rule({
  animation: `${highlightAnimation} 1.5s`,
});
