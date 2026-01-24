import type {StyleTheme} from '../types';
import {theme as font} from '../font/theme';
import {theme as color} from '../color/theme/dark';

export const theme: StyleTheme = {
  light: color.light,
  font,
  color,
};
