import {drule, rule} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...fonts.get('mono', 'bold'),
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
});

const capsClass = rule({
  fontVariantCaps: 'all-small-caps',
});

const implicitClass = rule({
  fontStyle: 'italic',
});

export interface MetaProps {
  /** Render in all-small-caps (e.g. YES / NO state words). */
  caps?: boolean;
  /** Italic — for inherited / auto / computed values (the implicit voice). */
  implicit?: boolean;
  /** Color intent. @default 'default' */
  tone?: 'default' | 'warning';
  /** Font size override; the default is `0.9em`, or `1em` when `caps` (small-caps already read smaller). */
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * The system-voice inline primitive: small muted mono for text the UI says
 * about the data rather than the data itself — "Empty", "3 selected", "Auto", "+4", YES/NO.
 */
export const Meta: React.FC<MetaProps> = ({caps, implicit, tone, size, className, style, children}) => {
  const styles = useStyles();
  const col = tone === 'warning' ? styles.warning.fg.toString() : styles.g(caps ? 0.35 : 0.55);
  let cn = blockClass({col});
  if (caps) cn += capsClass;
  if (implicit) cn += implicitClass;
  if (className) cn += ' ' + className;
  return (
    <span className={cn} style={{fontSize: size ?? (caps ? '1.1em' : '0.9em'), ...style}}>
      {children}
    </span>
  );
};
