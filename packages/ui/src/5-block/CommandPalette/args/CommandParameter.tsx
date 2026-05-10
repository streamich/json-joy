import * as React from 'react';
import {Code} from '../../../1-inline/Code';
import {useStyles} from '../../../styles/context';

export interface Props {
  label?: React.ReactNode;
  value: unknown;
  active?: boolean;
}

export const CommandParameter: React.FC<Props> = ({label, value, active}) => {
  const styles = useStyles();
  const success = styles.col.get('success', 'el-2');
  const negative = styles.col.get('error', 'el-2');

  const quote = typeof value === 'string' ? <span style={{color: success}}>{'"'}</span> : null;
  const valueFormatted = <span style={{color: styles.g(0)}}>{String(value)}</span>;
  const equal = <span style={{color: styles.g(0.5)}}>=</span>;
  const labelFormatted = <span style={{color: active ? negative : styles.g(0.5)}}>{label}</span>;

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
