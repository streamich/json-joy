import * as React from 'react';
import {theme, useTheme} from 'nano-theme';
import {valueBg, valueColor} from '../ClickableJson/utils';

const blue = theme.color.sem.blue[0];

export interface JsonAtomProps {
  value: unknown;
  onClick?: React.MouseEventHandler;
}

export const JsonAtom: React.FC<JsonAtomProps> = (props) => {
  const {value, onClick} = props;
  const theme = useTheme();

  let color = theme.g(0.2);
  let formatted: React.ReactNode = '∅';

  if (Array.isArray(value)) {
    color = blue;
    formatted = '[' + value.length + ']';
  } else if (value instanceof Uint8Array) {
    color = theme.g(0.45);
    formatted = (
      <span>
        {[...value]
          .slice(0, 128)
          .map((n) => (n < 16 ? '0' + n.toString(16) : n.toString(16)))
          .join(' ')}
        {value.length > 128 ? <span style={{color: theme.g(0.3)}}>{` … (${value.length - 128} more)`}</span> : ''}
      </span>
    );
  } else if (value && typeof value === 'object') {
    color = blue;
    formatted = '{' + Object.keys(value).length + '}';
  } else {
    color = valueColor(!theme.isLight, value) ?? color;
    if (typeof value === 'string') {
      const MAX_STR_LENGTH = 64;
      const needsTrim = value.length > MAX_STR_LENGTH;
      const str = JSON.stringify(needsTrim ? value.slice(0, MAX_STR_LENGTH) : value);
      if (needsTrim) {
        formatted = (
          <span>
            {str.slice(0, -1)}
            <span style={{color: theme.g(0.3)}}>{` … (${value.length - MAX_STR_LENGTH} more)`}</span>
            {'"'}
          </span>
        );
      } else formatted = str;
    } else {
      formatted = String(value);
    }
  }

  const background = valueBg(value);
  const style: React.CSSProperties = {
    color,
    background,
  };

  if (background) {
    style.borderRadius = 4;
    style.margin = -1;
    style.padding = 1;
  }

  return (
    <span style={style} onClick={onClick}>
      {formatted}
    </span>
  );
};
