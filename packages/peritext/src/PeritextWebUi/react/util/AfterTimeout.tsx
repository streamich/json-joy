import type * as React from 'react';
import {useTimeout} from '../hooks';

export interface IAfterTimeoutProps {
  ms?: number;
  children?: React.ReactNode;
}

export const AfterTimeout: React.FC<IAfterTimeoutProps> = ({ms = 200, children}) => {
  const ready = useTimeout(ms);

  return ready ? children : null;
};
