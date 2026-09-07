import {rule} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  ...fonts.get('mono', 'bold'),
  d: 'inline-flex',
  ai: 'baseline',
  gap: '4px',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
});

const unitClass = rule({
  fz: '0.85em',
  letterSpacing: '0.02em',
});

const mutedStyle: React.CSSProperties = {opacity: 0.6};

export interface NumProps {
  /** The number to render. */
  value: number;
  /** Fixed decimal places (`toFixed`). Default: render the value as-is. */
  precision?: number;
  /** Unit rendered after the number, smaller and muted (the `Bytes` pattern). */
  unit?: string;
  /** Hover title; defaults to the raw value and unit. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Inline technical rendering of a number: tabular mono digits with muted
 * thousands separators and an optional smaller, muted unit.
 */
export const Num: React.FC<NumProps> = ({value, precision, unit, title, className, style}) => {
  const styles = useStyles();
  const finite = Number.isFinite(value);
  const abs = Math.abs(value);
  const fixed = precision !== undefined && finite ? abs.toFixed(precision) : String(abs);
  const [int = '', frac] = fixed.split('.');
  // Exponent notation (very large/small values) is rendered verbatim.
  const plain = !finite || fixed.includes('e') || fixed.includes('E');
  const chunks: string[] = [];
  if (!plain) for (let end = int.length; end > 0; end -= 3) chunks.unshift(int.slice(Math.max(0, end - 3), end));

  return (
    <span
      className={blockClass + (className ? ` ${className}` : '')}
      style={{color: styles.g(0.25), ...style}}
      title={title ?? `${value}${unit ? ` ${unit}` : ''}`}
    >
      <span>
        {!plain && value < 0 && '-'}
        {plain
          ? String(value)
          : chunks.map((chunk, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={mutedStyle}>,</span>}
                {chunk}
              </React.Fragment>
            ))}
        {!plain && frac !== undefined && (
          <>
            <span style={mutedStyle}>.</span>
            {frac}
          </>
        )}
      </span>
      {!!unit && (
        <span className={unitClass} style={{color: styles.g(0.5)}}>
          {unit}
        </span>
      )}
    </span>
  );
};
