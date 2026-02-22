import * as React from 'react';
import {Modal} from '../../../../../../7-fullscreen/Modal';
import {useIconsGrid} from '../context';
import {IconDetails} from '../IconDetails';

export interface IconModalProps {
  set: string;
  icon: string;
}

export const IconModal: React.FC<IconModalProps> = ({set, icon}) => {
  const state = useIconsGrid();

  return (
    <Modal
      raise
      rounder
      onCloseClick={state.unselect}
      onEsc={state.unselect}
      onOutsideClick={state.unselect}
      title={`${icon}.svg`}
    >
      <IconDetails set={set} icon={icon} />
    </Modal>
  );
};
