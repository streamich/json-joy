import type {Theme} from '../types';
import {lightTheme} from './light';

const g: Theme['g'] = (shade: number, opacity: number = 1) => {
  const g = 255 - Math.round(255 * shade);
  return `rgba(${g},${g},${g},${opacity})`;
};

export const darkTheme: Theme = {
  ...lightTheme,
  isLight: false,
  name: 'dark',
  bg: '#1A1A1B',
  color: {
    ...lightTheme.color,
    ui: {
      lightLine: g(0.1, 0.04),
      line: g(0.1, 0.08),
      lineDark: g(0.1, 0.16),
    },
  },
  g,
};
