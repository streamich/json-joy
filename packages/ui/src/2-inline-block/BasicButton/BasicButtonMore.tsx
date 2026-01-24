import * as React from 'react';
import IconMore from '../../icons/svg/More';
import BasicButton, {type BasicButtonProps} from '../BasicButton';

export interface BasicButtonMoreProps extends BasicButtonProps {}

export const BasicButtonMore: React.FC<BasicButtonMoreProps> = (props) => {
  return (
    <BasicButton {...props}>
      <IconMore />
    </BasicButton>
  );
};
