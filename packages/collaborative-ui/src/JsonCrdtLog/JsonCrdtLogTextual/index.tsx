import * as React from 'react';
import {TextBlock} from '../../TextBlock';
import {useModelTick} from '../../hooks/useModelTick';
import {Scrollbox} from 'nice-ui/lib/4-card/Scrollbox';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';

export interface JsonCrdtLogTextualProps {
  log: Log<any>;
}

export const JsonCrdtLogTextual: React.FC<JsonCrdtLogTextualProps> = ({log}) => {
  useModelTick(log.end);

  return (
    <div style={{margin: '0 -8px -8px'}}>
      <Scrollbox style={{maxHeight: 600}}>
        <div style={{padding: '0 8px 8px'}}>
          <TextBlock compact src={log.toString()} />
        </div>
      </Scrollbox>
    </div>
  );
};
