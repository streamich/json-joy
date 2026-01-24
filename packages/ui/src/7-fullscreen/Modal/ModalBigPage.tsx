import * as React from 'react';
import {Modal, type ModalProps} from '.';
import {SizerBigModal} from './SizerBigModal';

export interface Props extends ModalProps {
  header?: React.ReactElement;
  wide?: boolean;
  narrow?: boolean;
}

export const ModalBigPage: React.FC<Props> = ({children, header, wide, narrow, ...rest}) => {
  return (
    <Modal {...rest} contrast>
      <SizerBigModal wide={wide} narrow={narrow} header={header}>
        {children}
      </SizerBigModal>
    </Modal>
  );
};

export default ModalBigPage;
