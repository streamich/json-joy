import * as React from 'react';
import {rule, useRule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const containerClass = rule({
  d: 'inline-flex',
  flexDirection: 'row',
  ai: 'stretch',
  pos: 'relative',
  ov: 'hidden',
  '& > *': {
    bdrad: 0,
  },
  '& > *:first-child': {
    borderTopLeftRadius: 'inherit',
    borderBottomLeftRadius: 'inherit',
  },
  '& > *:last-child': {
    borderTopRightRadius: 'inherit',
    borderBottomRightRadius: 'inherit',
  },
});

export interface BasicButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Border radius of the group */
  radius?: number;
  /** Whether buttons should be connected (no gap) */
  connected?: boolean;
  /** Gap between buttons when not connected */
  gap?: number;
  /** Whether to show dividers between buttons */
  dividers?: boolean;
  /** Whether to stretch buttons to fill the container */
  stretch?: boolean;
  children?: React.ReactNode;
}

export const BasicButtonGroup: React.FC<BasicButtonGroupProps> = ({
  radius = 4,
  connected = true,
  gap = 0,
  dividers = false,
  stretch = false,
  children,
  className = '',
  style,
  ...rest
}) => {
  const styles = useStyles();

  const dynamicContainerClass = useRule(() => ({
    bdrad: radius + 'px',
    gap: connected ? 0 : gap + 'px',
  }));

  const dividerClass = useRule(() => ({
    bg: styles.g(0, 0.15),
  }));

  const containerStyle: React.CSSProperties = {
    ...style,
  };

  if (stretch) {
    containerStyle.display = 'flex';
    containerStyle.width = '100%';
  }

  // Process children to add dividers if needed
  let processedChildren: React.ReactNode[] = React.Children.toArray(children);

  if (dividers && connected && processedChildren.length > 1) {
    const childrenWithDividers: React.ReactNode[] = [];
    processedChildren.forEach((child, index) => {
      childrenWithDividers.push(child);
      if (index < processedChildren.length - 1) {
        childrenWithDividers.push(
          <span
            key={`divider-${index}`}
            className={dividerClass}
            style={{
              width: 1,
              alignSelf: 'stretch',
            }}
          />
        );
      }
    });
    processedChildren = childrenWithDividers;
  }

  // Apply flex-grow to children when stretch is true
  if (stretch) {
    processedChildren = processedChildren.map((child) => {
      if (React.isValidElement(child) && !child.key?.toString().startsWith('divider')) {
        const childProps = child.props as {style?: React.CSSProperties};
        return React.cloneElement(child as React.ReactElement<{style?: React.CSSProperties}>, {
          style: {
            ...(childProps.style || {}),
            flex: 1,
          },
        });
      }
      return child;
    });
  }

  return (
    <div
      {...rest}
      className={className + containerClass + dynamicContainerClass}
      style={containerStyle}
    >
      {processedChildren}
    </div>
  );
};

export default BasicButtonGroup;
