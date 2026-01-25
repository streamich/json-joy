import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import {useModelView} from '../../hooks/useModelView';

export interface JsonCrdtDemoDisplayProps {
  model: Model;
}

export const JsonCrdtDemoDisplay: React.FC<JsonCrdtDemoDisplayProps> = ({model}) => {
  const view = useModelView(model);

  return (
    <code>
      <pre>{JSON.stringify(view, null, 2)}</pre>
    </code>
  );
};
