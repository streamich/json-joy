import * as React from 'react';
import {rule, useTheme} from 'nano-theme';

const blockClass = rule({
  w: '100%',
  h: '1px',
  d: 'flex',
  alignItems: 'stretch',
});

export interface Props {
  invisible?: boolean;
  contrast?: boolean;
  height?: number;
  grey?: boolean;
}

export const SeparatorColorful: React.FC<Props> = ({invisible, contrast, height = 1, grey = false}) => {
  const theme = useTheme();

  const style: React.CSSProperties = invisible
    ? {}
    : {background: theme.g(0.1, theme.isLight ? (contrast ? 0.12 : 0.06) : 0.08)};
  if (height !== 1) {
    style.height = height;
  }

  const brand = theme.color.sem.brand;
  const length = brand.length;
  const components: React.ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    components.push(
      <div
        key={i}
        style={{background: brand[i], width: 100 / length + '%', visibility: grey ? 'hidden' : 'visible'}}
      />,
    );
  }

  return (
    <div className={blockClass} style={style}>
      {components}
    </div>
  );
};
