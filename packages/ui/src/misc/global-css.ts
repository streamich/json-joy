import {put, theme} from 'nano-theme';

import 'nano-theme/lib/global-reset';

put('*:focus,button:focus,a:focus', {
  outlineOffset: '1px',
  out: `2px solid ${theme.color.sem.blue[0]}`,
});

put('*:active,button:active,a:active', {
  out: 0,
});

put('a,button', {
  bdrad: '2px',
});

put('.hoverRotate', {
  trs: 'transform .2s',
  transformOrigin: 'bottom left',
  '&:hover': {
    transform: 'rotate(-2deg)',
  },
});
