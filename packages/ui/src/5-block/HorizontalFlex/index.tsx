import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'flex',
});

export interface Props {
  middle?: boolean;
  spacing?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Display elements horizontally. */
export const HorizontalFlex: React.FC<Props> = ({middle, spacing, className, style, children}) => {
  const styles: React.CSSProperties = {
    alignItems: middle ? 'center' : undefined,
    ...(style || {}),
    ...style,
  };

  const props = {className: (className || '') + ' ' + blockClass, style: styles};

  if (spacing) {
    const childArray = React.Children.toArray(children);
    const childrenWithSpacers: React.ReactNode[] = [];
    if (childArray.length > 0) childrenWithSpacers.push(childArray[0]);
    for (let i = 1; i < childArray.length; i++)
      childrenWithSpacers.push(<div style={{width: spacing}} />, childArray[i]);
    return React.createElement('div', props, ...childrenWithSpacers);
  }

  return React.createElement('div', props, children);
};
