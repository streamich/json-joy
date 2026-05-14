export type Rules = Record<string, any>;

export const ROOT_DECLS: Rules = {
  ff: '"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",sans-serif',
  fw: 400,
  fz: '16px',
  lh: 1.15,
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  WebkitTapHighlightColor: 'transparent',
  // Themes native form controls (checkbox/radio/range).
  accentColor: '#07f',
};

export const DESCENDANT_RULES: Rules = {
  ':where(h1,h2,h3,h4,h5,h6,p,ul,ol,figure,blockquote,dl,dd)': {mr: 0},
  ':where(p,h1,h2,h3,h4,h5,h6)': {overflowWrap: 'break-word'},
  ':where(img,picture,video,canvas)': {d: 'block', maxW: '100%'},
  'button,input,optgroup,select,textarea': {
    ff: 'inherit',
    fz: '100%',
    lh: 1.15,
    mr: 0,
  },
  'code,kbd,samp,pre': {
    ff: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fz: '1em',
  },
  hr: {bxz: 'content-box', h: 0, ov: 'visible'},
  summary: {d: 'list-item'},
  a: {
    col: '#07f',
    textDecoration: 'none',
    '&:hover': {textDecoration: 'underline'},
  },
  'a,button': {bdrad: '2px'},
  'button:focus-visible,a:focus-visible': {
    outlineOffset: '1px',
    outline: '2px solid #07f',
  },
  'button:active,a:active': {outline: 0},
};

export const KEYFRAMES: Rules = {
  '@keyframes fadeInScaleOut': {
    from: {opacity: 0, transform: 'scale(.95)'},
    '80%': {opacity: 0.9, transform: 'scale(1.02)'},
    to: {opacity: 1, transform: 'scale(1)'},
  },
  '@keyframes fadeInScaleIn': {
    from: {opacity: 0, transform: 'scale(.9)'},
    '80%': {opacity: 0.9, transform: 'scale(.95)'},
    to: {opacity: 1, transform: 'scale(1)'},
  },
  '@keyframes slideInDown': {
    from: {transform: 'translate3d(0, -100%, 0)', visibility: 'visible'},
    to: {transform: 'translate3d(0, 0, 0)'},
  },
};
