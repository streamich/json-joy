import * as React from 'react';
import {useTheme} from 'nano-theme';
import {Input, type InputProps} from '../Input';

export interface InputColorProps extends InputProps {}

export const InputColor: React.FC<InputColorProps> = (props) => {
  const theme = useTheme();

  const swatchSize = props.label ? 32 : 16;
  const rightElement = (
    <div
      style={{
        width: 32,
        height: swatchSize,
        background: props.value || '#000000',
        padding: 0,
        margin: props.label ? '-18px -4px 0 0' : '-1px -4px 0 0',
        cursor: 'pointer',
        border: `3px solid ${theme.g(0.99, 0.9)}`,
        borderRadius: 2,
        boxShadow: `0px 1px 2px rgba(0,0,0,.2)`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <input
        type="color"
        value={props.value || '#000000'}
        onChange={(e) => props.onChange?.(e.target.value)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: 0,
          margin: 0,
          border: 0,
          cursor: 'pointer',
          opacity: 0,
        }}
      />
    </div>
  );

  return <Input right={rightElement} {...props} />;
};
