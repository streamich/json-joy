import {useFocus} from '@jsonjoy.com/click-json/lib/context/focus';
import {useStyles} from '@jsonjoy.com/click-json/lib/context/style';
import {FocusRegion} from '@jsonjoy.com/click-json/lib/FocusRegion';
import * as React from 'react';
import {context, pointerContext} from './context';
import {useIsolation} from './isolation';

export interface TypeHoverableProps {
  /** JSON Pointer of this node, relative to the root (without the `pfx`). */
  pointer: string;
  /** Toolbar rendered in the region's top-right corner while it is focused. */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps a node/row in a hover/focus region, mirroring `JsonHoverable` from
 * `click-json`, and publishes its pointer via {@link pointerContext} so
 * descendants (key metadata, examples) can derive their own pointers.
 */
export const TypeHoverable: React.FC<TypeHoverableProps> = ({pointer, toolbar, children}) => {
  const {focused, focus, pointed, point} = useFocus();
  const {pfx} = React.useContext(context);
  const {isolate} = useIsolation();
  const {compact} = useStyles();

  const prefixedPointer = pfx + pointer;

  const onDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isolate(pointer);
  };

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
    <pointerContext.Provider value={pointer}>
      <FocusRegion
        pointed={pointed === prefixedPointer}
        focused={focused === prefixedPointer}
        compact={compact}
        toolbar={toolbar}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </FocusRegion>
    </pointerContext.Provider>
  );
};
