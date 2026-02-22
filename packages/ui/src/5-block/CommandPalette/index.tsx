import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Modal} from '../../7-fullscreen/Modal';
import {CommandPaletteSizer} from './CommandPaletteSizer';

export interface CommandPaletteProps {
  input: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({input, header, footer, children, onClose}) => {
  const {width} = useWindowSize();

  const isSmall = width < 500;

  return (
    <Modal onEsc={onClose} onOutsideClick={onClose} noPadding raise contrast rounder>
      <CommandPaletteSizer>
        {input}
        {!isSmall && header}
        {children}
        {!isSmall && footer}
      </CommandPaletteSizer>
    </Modal>
  );
};
