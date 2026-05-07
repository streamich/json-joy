import type {Scale, Theme} from '../types';
import {color} from '../color';
import {font} from '../font';

const g: Theme['g'] = (shade: number, opacity: number = 1) => {
  const g = Math.round(255 * shade);
  return `rgba(${g},${g},${g},${opacity})`;
};

const spaces = [0, 4, 8, 16, 24, 32, 64, 128, 256, 512];
const fontSizes = [10, 12, 14, 16, 20, 24, 32, 48, 64, 96, 128];

export const lightTheme: Theme = {
  isLight: true,
  name: 'light',
  bg: '#fff',
  color: {
    color,
    sem: {
      accent: ['#07f', '#1340EB', '#07ACEB'],
      blue: ['#07f', '#1340EB', '#07ACEB'],
      positive: ['#13CE66', '#16BA32', '#38D420'],
      negative: ['#FF4949', '#EB4C31', '#DB521A'],
      warning: ['#FFC82C', '#EBC715', '#DBCC00'],
      link: ['#0089ff', '#134EEB', '#07BBEB'],
      brand: ['#E44A28', '#985DF7', '#EE69B1', '#F6A832', '#5FCC8A', '#58B9F8'],
    },
    ui: {
      lightLine: g(0.1, 0.04),
      line: g(0.1, 0.08),
      lineDark: g(0.1, 0.16),
    },
  },
  font,
  green: (opacity: number) => `rgba(19,206,102,${opacity})`,
  red: (opacity: number) => `rgba(225,20,10,${opacity})`,
  blue: (opacity: number) => `rgba(40,160,222,${opacity})`,
  fontSize: (scale: Scale = 0) => fontSizes[Math.min(Math.max(scale + 3, 0), fontSizes.length - 1)],
  space: (scale: Scale = 0) => spaces[Math.min(Math.max(scale + 3, 0), spaces.length - 1)],
  g,
};

export const theme = lightTheme;
