import * as React from 'react';
import {NodeRef} from '../../NodeRef';
import {ArrayInsert} from '../../../inserts/ArrayInsert';
import {useIsFocused} from '../../../context/focus';
import {createValue, id} from '../../utils';
import {useJsonCrdt} from '../../context';
import type {VecNode} from 'json-joy/lib/json-crdt';

export interface PushElementProps {
  node: NodeRef<VecNode>;
}

export const PushElement: React.FC<PushElementProps> = ({node}) => {
  const {model} = useJsonCrdt();
  const isFocused = useIsFocused(id(node));

  const handleSubmit = React.useCallback(
    (json: string, type: string) => {
      const valueId = createValue(model, json, type as any, true);
      const nodeApi = model.api.wrap(node.node);
      nodeApi.set([[(nodeApi.view() as unknown[]).length, valueId]]);
    },
    [node.node],
  );

  return <ArrayInsert withType visible={isFocused} onSubmit={handleSubmit} />;
};
