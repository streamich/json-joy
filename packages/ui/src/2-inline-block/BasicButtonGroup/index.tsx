import * as React from 'react';
import {rule} from 'nano-theme';
import {Space} from '../../3-list-item/Space';

const containerClass = rule({
  d: 'inline-flex',
  flexDirection: 'row',
  ai: 'center',
});

export interface BasicButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Space between buttons (negative values bring them closer) */
  gap?: number;
  children?: React.ReactNode;
}

export const BasicButtonGroup: React.FC<BasicButtonGroupProps> = ({
  gap = -5,
  children,
  className = '',
  style,
  ...rest
}) => {
  const childArray = React.Children.toArray(children);

  const processedChildren: React.ReactNode[] = [];
  childArray.forEach((child, index) => {
    processedChildren.push(child);
    if (index < childArray.length - 1) {
      // biome-ignore lint/suspicious/noArrayIndexKey: index is positionally stable
      processedChildren.push(<Space key={`space-${index}`} horizontal size={gap} />);
    }
  });

  return (
    <div {...rest} className={className + containerClass} style={style}>
      {processedChildren}
    </div>
  );
};
