import {theme, type Theme} from 'nano-theme';
import * as css from '../css';

export const valueColor = (isDark: boolean, value: unknown): string | undefined => {
  switch (typeof value) {
    case 'boolean':
      return css.ValueColor.bool[~~isDark];
    case 'string':
      return css.ValueColor.str[~~isDark];
    case 'number':
      return !value
        ? css.ValueColor.zero[~~isDark]
        : value === Math.round(value)
          ? css.ValueColor.num[~~isDark]
          : css.ValueColor.float[~~isDark];
    case 'bigint':
      return css.ValueColor.float[~~isDark];
    case 'object':
      return value === null ? css.ValueColor.nil[~~isDark] : undefined;
    case 'undefined':
      return css.ValueColor.undef[~~isDark];
  }
  return;
};

export const valueBg = (value: unknown): string | undefined => {
  return value === false || (typeof value === 'number' && value < 0) ? theme.red(0.06) : undefined;
};

export const inputColor = (isDark: boolean, input: string): string | undefined => {
  if (!input) return;
  input = input.trim();
  if (input === 'true' || input === 'false') return css.ValueColor.bool[~~isDark];
  if (input === 'null') return css.ValueColor.nil[~~isDark];
  if (input === 'undefined') return css.ValueColor.undef[~~isDark];
  if (input === '0') return css.ValueColor.zero[~~isDark];
  if (input.length < 24) {
    if (input[0] === '-' || (input[0] >= '0' && input[0] <= '9')) {
      try {
        const parsed = JSON.parse(input);
        if (typeof parsed === 'number') {
          if (parsed === Math.round(parsed)) return css.ValueColor.num[~~isDark];
          else return css.ValueColor.float[~~isDark];
        }
      } catch {}
    }
  }
  if (input[0] === '[' || input[0] === '{') return undefined;
  return css.ValueColor.str[~~isDark];
};

export const inputStyle = (theme: Theme, isDark: boolean, input: string): React.CSSProperties => {
  return {
    color: inputColor(isDark, input) || theme.g(0.1),
    background: theme.bg,
    borderColor: theme.g(0.7),
  };
};

export const typeahead = (value: string): string => {
  if (!value) return '';
  const length = value.length;
  if (length >= 5) return '';
  if ('true'.startsWith(value)) return 'true'.slice(length);
  if ('false'.startsWith(value)) return 'false'.slice(length);
  if ('null'.startsWith(value)) return 'null'.slice(length);
  return '';
};
