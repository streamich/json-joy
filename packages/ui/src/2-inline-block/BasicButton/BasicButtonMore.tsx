import * as React from 'react';
import {useT} from 'use-t';
import {More as MoreIcon} from '../../icons/interactive/More';
import BasicButton, {type BasicButtonProps} from '../BasicButton';
import {BasicTooltip} from '../../4-card/BasicTooltip';

export interface BasicButtonMoreProps extends BasicButtonProps {
  tooltip?: boolean | React.ReactNode;
}

export const BasicButtonMore: React.FC<BasicButtonMoreProps> = ({tooltip, ...rest}) => {
  const [t] = useT();
  const title = t('More');

  let element = (
    <BasicButton title={title} {...rest}>
      <MoreIcon />
    </BasicButton>
  );

  if (tooltip) {
    element = <BasicTooltip renderTooltip={() => (tooltip === true ? title : tooltip)}>{element}</BasicTooltip>;
  }

  return element;
};
