import * as React from 'react';
import {Iconista} from '../../icons/Iconista';
import BasicButton, {type BasicButtonProps} from '.';

export interface Props extends BasicButtonProps {}

export const BasicButtonAdd: React.FC<Props> = (props) => {
  const iconSize = (props.size || 16) > 28 ? 20 : 16;

  return (
    <BasicButton {...props}>
      <Iconista set="pluralsight" icon="plus.icon" width={iconSize} height={iconSize} />
    </BasicButton>
  );
};
