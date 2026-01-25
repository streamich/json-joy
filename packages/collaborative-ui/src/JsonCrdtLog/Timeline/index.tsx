import * as React from 'react';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import {Bar} from './Bar';

export interface TimelineProps {
  log: Log<any>;
}

export const Timeline: React.FC<TimelineProps> = ({log}) => {
  return <Bar log={log} />;
};
