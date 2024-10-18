import * as React from 'react';

export const TextView = React.forwardRef<HTMLSpanElement, {text: string; attr: React.HTMLAttributes<HTMLSpanElement>}>(
  (props, ref) => {
    return (
      <span {...props.attr} ref={ref}>
        {props.text}
      </span>
    );
  },
);
