import * as React from 'react';
import {LogicalTimestamp} from './index';
import {useModelTick} from '../hooks/useModelTick';
import type {Model} from 'json-joy/lib/json-crdt';

export interface ModelLogicalTimestampProps {
  model: Model;
}

export const ModelLogicalTimestamp: React.FC<ModelLogicalTimestampProps> = ({model}) => {
  useModelTick(model);

  const clock = model.clock;

  return <LogicalTimestamp sid={clock.sid} time={clock.time} />;
};
