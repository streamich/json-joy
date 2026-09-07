import {rule} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  ...fonts.get('mono', 'bold'),
  fz: '0.9em',
  d: 'inline-block',
  maxW: '100%',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  ws: 'nowrap',
  va: 'middle',
});

type CharClass = 'base' | 'digit' | 'upper' | 'sep' | 'ext' | 'sym';

/** Splits a string into runs of consecutive same-class characters (one span per run). */
export const parse = (value: string): Array<{cls: CharClass; text: string}> => {
  const list: Array<{cls: CharClass; text: string}> = [];
  for (const ch of value) {
    const cls: CharClass =
      ch >= '0' && ch <= '9'
        ? 'digit'
        : ch >= 'A' && ch <= 'Z'
          ? 'upper'
          : '-.:/#@'.includes(ch)
            ? 'sep'
            : ch >= 'a' && ch <= 'z'
              ? 'base'
              : /\p{L}/u.test(ch)
                ? 'ext'
                : 'sym';
    const last = list[list.length - 1];
    if (last && last.cls === cls) last.text += ch;
    else list.push({cls, text: ch});
  }
  return list;
};

export interface TechTextProps {
  /** The technical string (id, hash, URL, path, email) to render. */
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mono rendering of a machine-facing string with per-character-class tinting:
 * digits take the accent, uppercase reads slightly stronger than lowercase,
 * separator characters are muted scaffolding, symbols read pinkish-red (the
 * password-manager convention), and non-latin letters take a violet tint so
 * lookalike scripts (homographs) stand out. Single line, ellipsized.
 */
export const TechText: React.FC<TechTextProps> = ({value, className, style}) => {
  const styles = useStyles();
  const runs = React.useMemo(() => parse(value), [value]);
  const col: Record<Exclude<CharClass, 'base'>, string> = {
    digit: styles.accent + '',
    upper: styles.g(0.1),
    sep: styles.g(0.6, 0.8),
    ext: styles.important + '',
    sym: styles.negative + '',
  };

  return (
    <span
      className={blockClass + (className ? ` ${className}` : '')}
      style={{color: styles.g(0.35), ...style}}
      title={value}
    >
      {runs.map((run, i) =>
        run.cls === 'base' ? (
          run.text
        ) : (
          <span key={i} style={{color: col[run.cls]}}>
            {run.text}
          </span>
        ),
      )}
    </span>
  );
};
