import * as React from 'react';
import Arrow from '../../icons/interactive/Arrow';
import BasicButton, {type BasicButtonProps} from '../BasicButton';
import {keyframes, rule} from 'nano-theme';

const animationActive = keyframes({
  '0%': {
    transform: 'translate(0, 0)',
    filter: 'blur(0)',
  },
  '50%': {
    transform: 'translate(-100%, 0)',
    filter: 'blur(8px)',
  },
  '51%': {
    transform: 'translate(100%, 0)',
  },
  '100%': {
    transform: 'translate(0, 0)',
    filter: 'blur(0)',
  },
});

const animationClass = rule({
  d: 'inline-block',
  w: '100%',
  h: '100%',
  trs: 'all .12s ease-in 0s',
  '&:active': {
    an: `${animationActive} .24s forwards`,
  },
});

export interface BasicButtonBackProps extends BasicButtonProps {}

export const BasicButtonBack: React.FC<BasicButtonBackProps> = (props) => {
  return (
    <BasicButton {...props}>
      <span className={animationClass}>
        <Arrow direction={'l'} />
      </span>
    </BasicButton>
  );
};
