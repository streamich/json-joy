import * as React from 'react';
import {rule} from 'nano-theme';

const className = rule({
  d: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'stretch',
  bxz: 'border-box',
  '&>*': {
    flexGrow: 1,
  },
});

const stackClass = rule({
  flexWrap: 'wrap',
});

export interface Props extends React.HTMLAttributes<any> {
  as?: string;
  left?: number; // Left width.
  right?: number; // Right width.
  stack?: boolean;
}

export const FixedColumn: React.FC<Props> = (props) => {
  const {as = 'div', left, right, stack, children, ...rest} = props;
  const childrenArray = React.Children.toArray(children) as [React.ReactElement<any>, React.ReactElement<any>];
  const As = as as any;

  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(childrenArray) || childrenArray.length !== 2) {
      throw new TypeError('Children of <FixedColumn> must be exactly two React.ReactElement.');
    }
  }

  let [leftElement, rightElement] = childrenArray;

  if (left) {
    leftElement = React.cloneElement(leftElement, {
      ...leftElement.props,
      style: stack
        ? {width: '100%'}
        : {
            ...(leftElement.props.style || {}),
            width: left,
            flex: `0 0 ${left}px`,
          },
    });
  } else if (right) {
    rightElement = React.cloneElement(rightElement, {
      ...rightElement.props,
      style: stack
        ? {width: '100%'}
        : {
            ...(rightElement.props.style || {}),
            width: right,
            flex: `0 0 ${right}px`,
          },
    });
  } else {
    throw new TypeError('Either left or right prop of <FixedColumn> has to be specified.');
  }

  return (
    <As {...rest} className={(rest.className || '') + className + (stack ? stackClass : '')}>
      {leftElement}
      {rightElement}
    </As>
  );
};
