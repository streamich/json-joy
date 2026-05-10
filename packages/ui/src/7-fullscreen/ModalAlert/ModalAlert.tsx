import * as React from 'react';
import {lightTheme, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Modal, type ModalProps} from '../Modal';
import {Button} from '../../2-inline-block/Button';

const className = rule({
  ...lightTheme.font.sans,
  fz: '16px',
  lh: '1.5em',
  minW: '200px',
  maxW: '500px',
  ta: 'center',
  pad: `0 ${lightTheme.space(-2)}px`,
});

const footerClass = rule({
  pad: `${lightTheme.space(3)}px 0 0`,
});

export interface ModalAlertProps extends ModalProps {
  button?: React.ReactNode | (() => React.ReactNode);
  onOk?: React.MouseEventHandler<any>;
}

export const ModalAlert: React.FC<ModalAlertProps> = ({button = 'OK', onOk, children, ...rest}) => {
  const styles = useStyles();

  return (
    <Modal {...rest} contrast>
      <div className={className} style={{color: styles.g(0.3)}}>
        {children}
      </div>
      <div className={footerClass}>
        <Button block size={0} onClick={onOk}>
          {typeof button === 'function' ? button() : button}
        </Button>
      </div>
    </Modal>
  );
};
