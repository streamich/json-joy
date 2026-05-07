import {ThemeFontPalette} from './types';

const sans = '"Open Sans",sans-serif';
const serif = '"Merriweather","Linux Libertine"';
const slab = '"Roboto Slab"';
const ui1 =
  'Ubuntu,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Cantarell,"Open Sans","Helvetica Neue",sans-serif';
const ui2 =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol",' +
  ui1;
const ui3 = 'Roboto,sans-serif,' + ui2;

export const font: ThemeFontPalette = {
  sans: {
    lite: {fw: 300, ff: sans},
    mid: {fw: 400, ff: sans},
    bold: {fw: 700, ff: sans},
    black: {fw: 800, ff: sans},
  },
  serif: {
    lite: {fw: 300, ff: serif},
    mid: {fw: 400, ff: serif},
    bold: {fw: 700, ff: serif},
    black: {fw: 700, ff: serif},
  },
  slab: {
    lite: {fw: 300, ff: slab},
    mid: {fw: 400, ff: slab},
    bold: {fw: 700, ff: slab},
    black: {fw: 800, ff: slab},
  },
  mono: {
    mid: {
      fw: 300,
      ff: '"Menlo","DejaVu Sans Mono","Roboto Mono","Fira Mono","Cousine",Consolas,"Liberation Mono",Courier,monospace',
    },
    bold: {
      fw: 400,
      ff: '"Fira Mono","Cousine",Consolas,"Liberation Mono",Courier,monospace',
    },
  },
  ui1: {
    lite: {fw: 300, ff: ui1},
    mid: {fw: 400, ff: ui1},
    bold: {fw: 700, ff: ui1},
    black: {fw: 800, ff: ui1},
  },
  ui2: {
    lite: {fw: 300, ff: ui2},
    mid: {fw: 400, ff: ui2},
    bold: {fw: 700, ff: ui2},
    black: {fw: 800, ff: ui2},
  },
  ui3: {
    lite: {fw: 300, ff: ui3},
    mid: {fw: 400, ff: ui3},
    bold: {fw: 700, ff: ui3},
    black: {fw: 800, ff: ui3},
  },
};
