import * as React from 'react';
import {useClickAway} from '../../hooks/useClickAway';

export interface ClickAwayProps extends React.HTMLAttributes<any> {
  as?: React.ElementType;
  onElement?: (el: HTMLElement | null) => void;
  onClickAway: (e: Event) => void;
}

export const ClickAway: React.FC<ClickAwayProps> = ({as = 'div', onElement, onClickAway, ...rest}) => {
  const clickAwayRef = useClickAway(React.useCallback(onClickAway, []));
  const ref = React.useCallback(
    (el: HTMLElement | null) => {
      if (onElement) onElement(el);
      if (clickAwayRef) clickAwayRef(el);
    },
    [clickAwayRef, onElement],
  );

  return React.createElement(as, {ref, ...rest});
};
