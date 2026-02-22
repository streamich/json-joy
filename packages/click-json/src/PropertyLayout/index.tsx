import * as React from 'react';
import {useTheme} from 'nano-theme';
import * as css from '../css';

export interface PropertyLayoutProps {
  property: string;
  formal?: boolean;
  focused?: boolean;
}

export const PropertyLayout: React.FC<PropertyLayoutProps> = ({property, formal, focused}) => {
  const theme = useTheme();

  const style: React.CSSProperties = {
    color: theme.g(0.1),
  };

  if (focused) {
    style.background = theme.bg;
    style.border = `1px solid ${theme.g(0.9)}`;
    style.fontWeight = 'bold';
    style.margin = '-3px';
    style.padding = '2px';
  }

  if (!property || property.indexOf(' ') !== -1) {
    style.background = theme.blue(0.1);
  }

  return (
    <>
      <span className={css.property} style={style}>
        {formal ? JSON.stringify(property) : property}
      </span>
      <span className={css.colon} style={{color: theme.g(0.5)}}>
        <span>:</span>
      </span>
    </>
  );
};
