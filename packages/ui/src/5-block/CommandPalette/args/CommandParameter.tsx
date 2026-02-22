import * as React from 'react';
import {Code} from '../../../1-inline/Code';
import {useTheme} from 'nano-theme';

export interface Props {
  label?: React.ReactNode;
  value: unknown;
  active?: boolean;
}

export const CommandParameter: React.FC<Props> = ({label, value, active}) => {
  const theme = useTheme();

  const quote = typeof value === 'string' ? <span style={{color: theme.color.sem.positive[1]}}>{'"'}</span> : null;
  const valueFormatted = <span style={{color: theme.g(0)}}>{String(value)}</span>;
  const equal = <span style={{color: theme.g(0.5)}}>=</span>;
  const labelFormatted = <span style={{color: active ? theme.color.sem.negative[1] : theme.g(0.5)}}>{label}</span>;

  return (
    <Code gray noBg>
      {labelFormatted} {equal}{' '}
      <strong>
        {quote}
        {valueFormatted}
        {quote}
      </strong>
    </Code>
  );
};
