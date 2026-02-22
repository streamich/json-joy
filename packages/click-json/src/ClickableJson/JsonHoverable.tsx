import * as React from 'react';
import {context} from './context';
import {FocusRegion} from '../FocusRegion';
import {useFocus} from '../context/focus';
import {useStyles} from '../context/style';
import {useInput} from '../context/input';

export interface JsonHoverableProps {
  pointer: string;
  children: React.ReactElement;
}

export const JsonHoverable: React.FC<JsonHoverableProps> = ({pointer, children}) => {
  const {focused, focus, pointed, point} = useFocus();
  const {pfx, onChange} = React.useContext(context);
  const {compact} = useStyles();
  const input = useInput();

  const prefixedPointer = pfx + pointer;

  const onMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pointed !== prefixedPointer) point(prefixedPointer);
  };

  const onMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    point(prefixedPointer);
  };

  const onMouseLeave = () => {
    point(null);
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focus(prefixedPointer);
  };

  return (
    <FocusRegion
      pointed={pointed === prefixedPointer}
      focused={focused === prefixedPointer}
      compact={compact}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDelete={
        !!onChange && !input.focused && prefixedPointer === focused
          ? () => onChange([{op: 'remove', path: pointer}])
          : undefined
      }
    >
      {children}
    </FocusRegion>
  );
};
