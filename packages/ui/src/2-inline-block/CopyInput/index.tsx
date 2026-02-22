import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {NotchedOutline} from '../NotchedOutline';
import {Split} from '../../3-list-item/Split';
import {CopyButton} from '../CopyButton';

const font = theme.font.ui2;

const inpClass = rule({
  ...font.bold,
  fz: '15px',
  lh: '1.4em',
  d: 'block',
  w: '100%',
  bxz: 'border-box',
  bd: 0,
  bdrad: '4px',
  mr: 0,
  pd: '4px 5px',
  out: 0,
  '&:disabled': {
    bg: 'transparent',
  },
});

export interface CopyInputProps {
  disabled?: boolean;
  value?: string;
  label?: string;
  type?: 'text' | 'password' | 'email';
  readOnly?: boolean;
  size?: number;
}

export const CopyInput: React.FC<CopyInputProps> = (props) => {
  const {disabled, value = '', label, size, readOnly, type = 'text'} = props;
  const [focus] = React.useState(false);

  const style: React.CSSProperties = {};

  if (size) {
    const factor = size < 0 ? 1 : 2;
    style.fontSize = `${15 + size * factor}px`;
    style.paddingTop = `${4 + size * factor}px`;
    style.paddingBottom = `${4 + size * factor}px`;
    if (size < 0) {
      style.fontWeight = font.mid.fw;
    }
  }

  return (
    <NotchedOutline label={label} active={focus} disabled={disabled || readOnly}>
      <Split style={{alignItems: 'center'}}>
        <input
          className={inpClass}
          style={style}
          readOnly
          value={value}
          type={type}
          disabled={disabled}
          onMouseDown={(event) => {
            const input = event.nativeEvent.target as HTMLInputElement;
            if (!input) return;
            event.preventDefault();
            input.select();
          }}
        />
        <div>
          <CopyButton onCopy={() => value} />
        </div>
      </Split>
    </NotchedOutline>
  );
};
