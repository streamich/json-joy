import * as React from 'react';
import {NodeRef} from '../../NodeRef';
import {ObjectInsert} from '../../../inserts/ObjectInsert';
import {useIsFocused} from '../../../context/focus';
import {createValue, id} from '../../utils';
import {useJsonCrdt} from '../../context';
import type {ObjNode} from 'json-joy/lib/json-crdt';

export interface AddKeyProps {
  node: NodeRef<ObjNode>;
}

export const AddKey: React.FC<AddKeyProps> = ({node}) => {
  const {model} = useJsonCrdt();
  const isFocused = useIsFocused(id(node));

  const handleSubmit = React.useCallback(
    (key: string, json: string, type: string) => {
      const valueId = createValue(model, json, type as any, true);
      const nodeApi = model.api.wrap(node.node);
      nodeApi.set({[key]: valueId});
    },
    [node.node],
  );

  return <ObjectInsert withType visible={isFocused} onSubmit={handleSubmit} />;
};
