import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';

const mono = fonts.get('mono', 'mid');

const blockClass = rule({
  ...mono,
  d: 'inline-block',
  fz: '10.5px',
  lh: '14px',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
});

export interface EyebrowProps {
  /** Override the label color (defaults to the muted neutral). */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * A small mono, uppercase, letter-spaced label — the design system's *eyebrow*.
 * Used for type/kind labels above a title, section/group headers, and field
 * labels in the property card. Renders inline so it composes anywhere.
 */
export const Eyebrow: React.FC<EyebrowProps> = ({color, className, style, children}) => {
  const styles = useStyles();
  return (
    <span className={blockClass + (className ? ' ' + className : '')} style={{color: color ?? styles.g(0.5), ...style}}>
      {children}
    </span>
  );
};
