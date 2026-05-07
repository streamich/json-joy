import {put, reset} from './css';
import {lightTheme} from './themes/light';

export const googleFonts =
  'https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,800|Roboto+Mono|Merriweather:300,400,700|Roboto+Slab:300,400,700|Roboto:300,500|Ubuntu:400&subset=cyrillic';

const isClient = typeof window === 'object';

if (isClient) {
  const href = googleFonts;
  const el = document.createElement('link');
  el.href = href;
  el.rel = 'stylesheet';
  el.type = 'text/css';
  document.head.appendChild(el);
}

// CSS reset.
reset();

put('', {
  '@keyframes fadeInScaleOut': {
    from: {
      opacity: 0,
      transform: 'scale(.95)',
    },
    '80%': {
      opacity: 0.9,
      transform: 'scale(1.02)',
    },
    to: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },

  '@keyframes fadeInScaleIn': {
    from: {
      opacity: 0,
      transform: 'scale(.9)',
    },
    '80%': {
      opacity: 0.9,
      transform: 'scale(.95)',
    },
    to: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },

  '@keyframes slideInDown': {
    from: {
      transform: 'translate3d(0, -100%, 0)',
      visibility: 'visible',
    },
    to: {
      transform: 'translate3d(0, 0, 0)',
    },
  },

  '.slideInDown': {
    animation: 'slideInDown .3s',
  },

  a: {
    col: lightTheme.color.sem.link[0],
    td: 'none',
    '&:hover': {
      col: lightTheme.color.sem.brand[0],
    },
  },
  'button:focus,a:focus': {
    outlineOffset: '1px',
    out: '1px dashed rgba(0,0,0,.2)',
  },
  'button:active,a:active': {
    out: 0,
  },
});
