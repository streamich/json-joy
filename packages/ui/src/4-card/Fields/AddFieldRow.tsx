import {drule} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {useRoundnessTrace, useSpacingTrace} from '../../context/traces';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import {buttonRadiusFor} from './metrics';

const rowClass = drule({
  ...fonts.get('display', 'mid', 0),
  d: 'flex',
  ai: 'center',
  gap: '8px',
  w: 'calc(100% - 20px)',
  mar: '0 10px',
  bxz: 'border-box',
  bd: 0,
  bg: 'transparent',
  out: 0,
  cur: 'pointer',
  ta: 'start',
  us: 'none',
  pd: '0 6px',
  trs: 'background .12s, color .12s',
});

export interface AddFieldRowProps {
  onClick: () => void;
  label?: React.ReactNode;
  spacing?: number;
}

export const AddFieldRow: React.FC<AddFieldRowProps> = ({onClick, label, spacing: spacingProp}) => {
  const [t] = useT();
  const styles = useStyles();
  const spacingTrace = useSpacingTrace(0.5);

  const spacing = spacingProp ?? spacingTrace;
  const radius = buttonRadiusFor(useRoundnessTrace(0.5) ?? 0.5);
  const rowHeight = Math.round(22 + spacing * 20);
  const labelFont = Math.round(13 + spacing * 2) - 1.2;

  return (
    <button
      type="button"
      onClick={onClick}
      className={rowClass({
        col: styles.g(0.5),
        '&:hover': {col: styles.g(0.2), bg: styles.g(0, 0.04)},
        '&:focus-visible': {col: styles.g(0.2), bg: styles.g(0, 0.04)},
      })}
      style={{height: rowHeight, fontSize: labelFont, borderRadius: radius}}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          fontSize: labelFont + 3,
          lineHeight: 1,
        }}
        aria-hidden
      >
        +
      </span>
      <span>{label ?? t('Add field')}</span>
    </button>
  );
};
