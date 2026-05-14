import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../../../styles/context';

const wrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  pad: '0 6px',
  bdrad: '4px',
  trs: 'color .12s, background .12s, opacity .12s',
  whiteSpace: 'nowrap',
});

export interface AutoValueProps {
  /** Fires when the user clicks the value to enter custom mode. */
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * Greyed-out clickable value display used in `def: true` (auto) mode by
 * defaultable args.
 */
export const AutoValue: React.FC<AutoValueProps> = ({onClick, children}) => {
  const styles = useStyles();
  const [hover, setHover] = React.useState(false);
  return (
    <span
      className={wrapClass}
      style={
        hover
          ? {color: styles.g(0.05), background: styles.g(0, 0.06), opacity: 1}
          : {color: styles.g(0.5), opacity: 0.75}
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
};
