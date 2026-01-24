import * as React from 'react';
import {Close} from '../Close';
import {rule, lightTheme as theme} from 'nano-theme';
import {Ripple} from '../../../misc/Ripple';

const className = rule({
  bdrad: '50%',
  boxSizing: 'border-box',
  cur: 'pointer',
});

export interface Props {
  small?: boolean;
  onClick?: React.MouseEventHandler<any>;
}

export const CloseCircle: React.FC<Props> = ({small, onClick}) => {
  const size = small ? 36 : 64;
  return (
    <Ripple color={theme.g(0.94)} ms={small ? 5_000 : 2_000}>
      <div className={className} style={{width: size, height: size}} onClick={onClick}>
        <Close style={{width: size, height: size}} />
      </div>
    </Ripple>
  );
};
