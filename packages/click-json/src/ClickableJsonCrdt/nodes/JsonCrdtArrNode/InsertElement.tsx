import * as React from 'react';
import {NodeRef} from '../../NodeRef';
import {ArrayInsert} from '../../../inserts/ArrayInsert';
import {useIsFocused} from '../../../context/focus';
import {createValue, id} from '../../utils';
import {useJsonCrdt} from '../../context';
import type {ArrNode} from 'json-joy/lib/json-crdt';

export interface InsertElementProps {
  node: NodeRef<ArrNode>;
  index: number;
}

export const InsertElement: React.FC<InsertElementProps> = ({node, index}) => {
  const {model} = useJsonCrdt();
  const isFocused = useIsFocused(id(node));

  const handleSubmit = React.useCallback(
    (json: string, type: string) => {
      const valueId = createValue(model, json, type as any);
      const nodeApi = model.api.wrap(node.node);
      nodeApi.ins(index, [valueId]);
    },
    [node.node],
  );

  return <ArrayInsert withType visible={isFocused} onSubmit={handleSubmit} />;
};
