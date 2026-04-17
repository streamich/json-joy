import * as React from 'react';
import {More as MoreIcon} from '../../icons/interactive/More';
import BasicButton, {type BasicButtonProps} from '../BasicButton';

export interface BasicButtonMoreProps extends BasicButtonProps {}

export const BasicButtonMore: React.FC<BasicButtonMoreProps> = (props) => {
  return (
    <BasicButton {...props}>
      <MoreIcon />
    </BasicButton>
  );
};
