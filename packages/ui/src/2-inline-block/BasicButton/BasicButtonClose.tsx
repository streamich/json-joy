import * as React from 'react';
import {Close as CloseIcon} from '../../icons/interactive/Close';
import BasicButton, {type BasicButtonProps} from '.';

export interface BasicButtonCloseProps extends BasicButtonProps {}

export const BasicButtonClose: React.FC<BasicButtonCloseProps> = (props) => {
  return (
    <BasicButton {...props}>
      <CloseIcon />
    </BasicButton>
  );
};
