import * as React from 'react';
import {useT} from 'use-t';
import BasicButton, {type BasicButtonProps} from '../BasicButton';
import {BasicTooltip} from '../../4-card/BasicTooltip';
import FlipHorizontal from '../../icons/interactive/FlipHorizontal';
import {Iconista} from '../../icons/Iconista';

const trashIcon = <Iconista set="bootstrap" icon="trash2" width={16} height={16} />
const trashIconAnimated = (
  <FlipHorizontal>
    {trashIcon}
  </FlipHorizontal>
);

export interface BasicButtonDeleteProps extends BasicButtonProps {
  tooltip?: boolean | React.ReactNode;
}

export const BasicButtonDelete: React.FC<BasicButtonDeleteProps> = (props) => {
  const [t] = useT();
  const title = t('Delete');

  let element = (
    <BasicButton title={title} {...props}>
      {trashIconAnimated}
    </BasicButton>
  );

  if (props.tooltip) {
    element = (
      <BasicTooltip renderTooltip={() => props.tooltip === true ? title : props.tooltip}>
        {element}
      </BasicTooltip>
    );
  }

  return element;
};
