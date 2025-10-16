import * as React from 'react';
import {CaretFrame} from '../util/CaretFrame';
import {CaretTopOverlay} from './CaretTopOverlay';
import {CaretBottomOverlay} from './CaretBottomOverlay';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = (props) => {
  const {children} = props;

  return (
    <CaretFrame over={<CaretTopOverlay {...props} />} under={<CaretBottomOverlay {...props} />}>
      {children}
    </CaretFrame>
  );
};
