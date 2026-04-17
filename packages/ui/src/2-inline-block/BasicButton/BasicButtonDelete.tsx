import * as React from 'react';
import {useT} from 'use-t';
import BasicButton, {type BasicButtonProps} from '../BasicButton';
import {BasicTooltip} from '../../4-card/BasicTooltip';
import FlipHorizontal from '../../icons/interactive/FlipHorizontal';
import {Iconista} from '../../icons/Iconista';
import {Popup} from '../../4-card/Popup';
import {ContextMenu} from '../../4-card/ContextMenu';
import {Sidetip} from '../../1-inline/Sidetip';

const trashIcon = <Iconista set="bootstrap" icon="trash2" width={16} height={16} />
const trashIconAnimated = (
  <FlipHorizontal>
    {trashIcon}
  </FlipHorizontal>
);

export interface BasicButtonDeleteProps extends BasicButtonProps {
  tooltip?: boolean | React.ReactNode;
  onConfirm?: () => void;
}

export const BasicButtonDelete: React.FC<BasicButtonDeleteProps> = ({tooltip, onConfirm, ...rest}) => {
  const [t] = useT();
  const title = t('Delete');

  let element = (
    <BasicButton title={title} {...rest}>
      {trashIconAnimated}
    </BasicButton>
  );

  if (tooltip) {
    element = (
      <BasicTooltip renderTooltip={() => tooltip === true ? title : tooltip} onClick={!!onConfirm ? () => {} : rest.onClick}>
        {element}
      </BasicTooltip>
    );
  }

  if (onConfirm) {
    element = (
      <Popup renderContext={({onEsc}) => (
        <ContextMenu inset onEsc={onEsc} menu={{
          name: 'Confirm delete',
          minWidth: 240,
          children: [
            {
              name: 'Cancel',
              onSelect: () => {},
            },
            {
              name: 'Delete',
              onSelect: onConfirm,
              danger: true,
              right: () => <Sidetip small>{t('Are you sure?')}</Sidetip>,
              icon: () => <Iconista set="bootstrap" icon="lightning" width={16} height={16} />,
            },
          ],
        }} />
      )}>
        {element}
      </Popup>
    );
  }

  return element;
};
