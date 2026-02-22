import {theme} from 'nano-theme';

const colors = theme.color.color;
const colorCount = colors.length;

export const sidColor = (sid: number): string => {
  const color = colors[sid % colorCount];
  return color;
};
