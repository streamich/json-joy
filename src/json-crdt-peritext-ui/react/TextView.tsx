import * as React from 'react';

export const TextView = React.memo(
  React.forwardRef<HTMLSpanElement, {text: string}>((props, ref) => {
    return (
      <span ref={ref} className="jsonjoy-text">
        {props.text}
      </span>
    );
  }),
  (prev, next) => prev.text === next.text,
);
