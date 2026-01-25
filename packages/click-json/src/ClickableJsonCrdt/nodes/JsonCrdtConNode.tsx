import * as React from 'react';
import {JsonCrdtProperty} from '../JsonCrdtProperty';
import {JsonCrdtRegion} from '../JsonCrdtRegion';
import {useStyles} from '../../context/style';
import {id} from '../utils';
import {JsonCrdtConstant} from '../JsonCrdtConstant';
import type {ConNode} from 'json-joy/lib/json-crdt';
import type {NodeRef} from '../NodeRef';

export interface JsonCrdtConNodeProps {
  node: NodeRef<ConNode>;
}

export const JsonCrdtConNode: React.FC<JsonCrdtConNodeProps> = ({node}) => {
  const {formal} = useStyles();

  return (
    <JsonCrdtRegion node={node}>
      <JsonCrdtProperty node={node} />
      <JsonCrdtConstant id={id(node)} view={node.node.view()} />
      {!!formal && ','}
    </JsonCrdtRegion>
  );
};
