import * as React from 'react';
import {useTheme, makeRule, drule} from 'nano-theme';

export const blockClass = drule({
  bdrad: '4px',
  trs: 'background .3s'
});

const useHoverBlockClass = makeRule((theme) => ({
  bd: `1px solid ${theme.g(0, 0.1)}`,
  '&:hover': {
    bd: `1px solid ${theme.g(0, 0.2)}`,
  },
  '&:active': {
    bd: `1px solid ${theme.g(0, 0.3)}`,
  },
}));

const hoverElevateClass = drule({
  trs: 'box-shadow 0.5s',
});

export interface PaperProps extends React.AllHTMLAttributes<any> {
  level?: number;
  fill?: number;
  round?: boolean;
  hover?: boolean;
  hoverBg?: boolean;
  hoverLite?: boolean;
  hoverElevate?: boolean;
  contrast?: boolean;
  noOutline?: boolean;
}

export const Paper: React.FC<PaperProps> = (props) => {
  const {level = 0, fill = 0, round, hover, hoverBg, hoverLite, hoverElevate, contrast, noOutline, ...rest} = props;
  const theme = useTheme();
  const dynamicHoverBlockClass = useHoverBlockClass();

  const style: React.CSSProperties = {};

  if (!hover) {
    style.border = `1px solid ${theme.g(0, contrast ? 0.2 : 0.1)}`;
  }

  if (level > 1) {
    style.border = `1px solid ${theme.g(0, 0.1 + 0.03 * level)}`;
  }

  if (noOutline) {
    style.border = 'none';
  }

  if (round) {
    style.borderRadius = '16px';
  }

  return React.createElement('div', {
    ...rest,
    className:
      props.className +
      blockClass({
        'a &': {
          col: theme.g(0.25),
        },
        bxsh: level
          ? `0px 1px ${1 + level * 2}px 0px ${theme.g(0, 0.2)}, 0px ${level}px ${level}px 0px ${theme.g(0, 0.14)}, 0px ${
              1 + level
            }px 1px -${level}px ${theme.g(0, 0.12)}`
          : 'none',
        ...(hoverBg ? {
          bg: fill ? theme.g(0, fill * 0.02) : theme.bg,
          '&:hover': {
            bg: theme.g(0, 0.02),
          }
        } : {}),
      }) +
      (hover ? dynamicHoverBlockClass : '') +
      (hoverElevate
        ? hoverElevateClass({
            '&:hover': {
              bxsh: '0 3px 5px rgba(0,0,0,.1), 0 10px 20px rgba(0,0,0,.1)',
            },
          })
        : ''),
    style: {...style, ...(props.style || {})},
  });
};

export default Paper;
