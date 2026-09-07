import {rule} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {useStyles} from '../../../styles/context';
import {BasicTooltip} from '../../BasicTooltip';

const PinIcon: React.FC<{size?: number}> = ({size = 12}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 17v5M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 2 2 0 000-4H8a2 2 0 000 4 1 1 0 011 1z" />
  </svg>
);

const btnClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '16px',
  h: '16px',
  pad: 0,
  mar: 0,
  bd: 0,
  bg: 'transparent',
  bdrad: '4px',
  out: 'none',
  flexShrink: 0,
  trs: 'background .15s, color .15s',
  '&:focus-visible': {bg: 'rgba(127,127,127,0.2)'},
});

export interface DefaultableToggleProps {
  def: boolean;
  onClick: () => void;
}

export const DefaultableToggle: React.FC<DefaultableToggleProps> = ({def, onClick}) => {
  const [t] = useT();
  const styles = useStyles();

  const label = def ? 'Override default' : 'Use default';

  return (
    <BasicTooltip renderTooltip={() => t(label)}>
      <button
        type="button"
        aria-label={t(label)}
        className={btnClass}
        style={{color: styles.g(0.35)}}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = styles.g(0, 0.06);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        {def ? (
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgba(127,127,127,0.2)',
            }}
          />
        ) : (
          <PinIcon size={12} />
        )}
      </button>
    </BasicTooltip>
  );
};
