import {theme as lightTheme} from './light';
import type {ColorTheme} from '../types';

// prettier-ignore
export const theme: ColorTheme = {
  ...lightTheme,
  light: false,
  scales: {
    //   bg-1  bg-2  el-1  el-2  el-3  bd-1  bd-2  bd-3  sol-1 sol-2 txt-1 txt-2
    L:  [   9,   12,   16,   20,   24,   32,   38,   44,   52,   58,   76,   88],
    xS: lightTheme.scales!.xS,
    dH: lightTheme.scales!.dH,
  },
  mapping: {
    bg: ['neutral', 0, 0, {L: 9}],
  },
};
