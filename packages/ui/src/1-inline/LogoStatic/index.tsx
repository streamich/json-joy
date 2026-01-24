import * as React from 'react';
import {rule, useTheme, type Theme} from 'nano-theme';

const defaultSize = 48;

const className = rule({
  h: defaultSize + 'px',
  w: defaultSize + 'px',
  letterSpacing: `-${defaultSize / 6}px`,
  lh: defaultSize + 'px',
  ta: 'center',
});

export type LogoTheme = [string, string, string, string];

const colorThemeDefault = ['#F94870', '#FFD16E', '#008AB0', '#00D6A1'];
const colorThemeRed = ['#FF486A', '#FF967B', '#9D4063', '#414369'];

const greyColorTheme = (theme: Theme) => [
  theme.g(0.1, 0.24),
  theme.g(0.1, 0.38),
  theme.g(0.1, 0.48),
  theme.g(0.1, 0.7),
];

export interface LogoStaticProps {
  size?: number;
  grey?: boolean;
  colors?: 'default' | 'red';
  variant?: 'default' | 'round';
  style?: React.CSSProperties;
}

export const LogoStatic: React.FC<LogoStaticProps> = ({
  size = 48,
  grey,
  colors = 'default',
  variant = 'default',
  style: providedStyle,
}) => {
  const theme = useTheme();

  const colorTheme = grey ? greyColorTheme(theme) : colors === 'red' ? colorThemeRed : colorThemeDefault;
  let style: React.CSSProperties | undefined = providedStyle || {};

  if (size !== defaultSize) {
    style = {
      ...style,
      height: size,
      width: size,
      letterSpacing: `-${size / 5}px`,
      lineHeight: size + 'px',
      fontSize: (size * 2.85) / 3 + 'px',
    };
  }

  const svgProps: React.SVGAttributes<any> = {
    style: {
      width: 0.67 * size,
      height: 0.67 * size,
    },
    viewBox: '0 0 64 64',
  };

  let svg: React.ReactElement<React.SVGAttributes<any>>;

  if (variant === 'round') {
    svg = (
      <svg {...svgProps}>
        <path
          fill={colorTheme[0]}
          d="M33,0H2.6C1.2,0,0,1.2,0,2.6v30.6c0,1.7,2,2.5,3.2,1.3l15.6-15.6L34.3,3.2C35.5,2,34.7,0,33,0z"
        />
        <path
          fill={colorTheme[1]}
          d="M7.9,41.2h30.4c1.4,0,2.6-1.2,2.6-2.6V8c0-1.7-2-2.5-3.2-1.3L22.2,22.3L6.6,38C5.4,39.2,6.3,41.2,7.9,41.2z"
        />
        <path
          fill={colorTheme[2]}
          d="M45.9,3.3l-0.1,34.4c0,1.8,1.7,3,3.4,2.5C57.7,37.8,64,29.9,64,20.6c0-9.3-6.2-17.2-14.7-19.8 C47.6,0.3,45.9,1.6,45.9,3.3z"
        />
        <path fill={colorTheme[3]} d="M9,64L9,64c5,0,9-4,9-9v0c0-5-4-9-9-9h0c-5,0-9,4-9,9v0C0,60,4,64,9,64z" />
      </svg>
    );
  } else {
    svg = (
      <svg {...svgProps}>
        <polygon fill={colorTheme[0]} points="0,0 42.6,0 0,42.8" />
        <polygon fill={colorTheme[1]} points="42.6,42.8 0,42.8 42.6,0" />
        <path fill={colorTheme[2]} d="M42.6,0v42.8c11.8,0,21.4-9.6,21.4-21.4S54.4,0,42.6,0z" />
        <rect fill={colorTheme[3]} y="42.8" width="21.3" height="21.2" />
      </svg>
    );
  }

  return (
    <div className={className} style={style}>
      {svg}
    </div>
  );
};
