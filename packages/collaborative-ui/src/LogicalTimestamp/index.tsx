import * as React from 'react';
import {sidColor} from '../util/sidColor';
import {rule, theme} from 'nano-theme';

const blockClass = rule({
  ...theme.font.mono.bold,
  d: 'inline-block',
  fz: '12px',
  pdt: '1px',
});

export interface LogicalTimestampProps {
  sid?: number;
  time: number;
}

export const LogicalTimestamp: React.FC<LogicalTimestampProps> = ({sid = 0, time}) => {
  const [trim, setTrim] = React.useState(0);

  const isReservedSession = sid < 10000;
  const color = sidColor(sid);

  return (
    <code className={blockClass} onClick={() => setTrim((x) => x + 1)} onKeyDown={() => {}}>
      {isReservedSession ? (
        <span style={{opacity: 0.5}}>{sid + ''}</span>
      ) : (
        !!(trim % 3) && <span style={{opacity: 0.5}}>{trim % 3 === 1 ? '…' + (sid + '').slice(-4) : sid}</span>
      )}
      <span
        style={{
          background: color,
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: 4,
          margin: !isReservedSession && !(trim % 3) ? '2px 4px 0 0' : '2px 4px 0',
        }}
      />
      {time}
    </code>
  );
};
