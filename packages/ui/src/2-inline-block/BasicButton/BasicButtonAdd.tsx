import * as React from 'react';
import {Close as CloseIcon} from '../../icons/interactive/Close';
import BasicButton, {type BasicButtonProps} from '.';

export interface Props extends BasicButtonProps {}

export const BasicButtonAdd: React.FC<Props> = (props) => {
  return (
    <BasicButton {...props}>
      <span style={{transform: `rotate(45deg)`}}>
        <CloseIcon  />
      </span>
    </BasicButton>
  );
};
