import * as React from 'react';
import * as css from '../../css';
import {NodeRef, nodeRef} from '../NodeRef';
import {useJsonCrdt} from '../context';
import {JsonCrdtRegion} from '../JsonCrdtRegion';
import {JsonCrdtProperty} from '../JsonCrdtProperty';
import {JsonCrdtObjectLayout} from '../JsonCrdtObjectLayout';
import {JsonAtom} from '../../JsonAtom';
import {useRerenderModel} from '../hooks';
import type {ValNode} from 'json-joy/lib/json-crdt';

export interface JsonCrdtValNodeProps {
  node: NodeRef<ValNode>;
}

export const JsonCrdtValNode: React.FC<JsonCrdtValNodeProps> = ({node}) => {
  const {render} = useJsonCrdt();
  useRerenderModel();

  const childNode = node.node.node();
  if (!childNode) return null;
  const childNodeRef = nodeRef(childNode, node, '');
  if (!childNodeRef) return null;
  const child = <span className={css.line}>{render(childNodeRef)}</span>;

  let collapsedView: React.ReactNode = '…';
  if (childNode.name() === 'con') {
    const view = childNode.view();
    collapsedView = <JsonAtom value={view} />;
  }

  return (
    <JsonCrdtRegion node={node}>
      <JsonCrdtObjectLayout
        node={node}
        property={<JsonCrdtProperty node={node} />}
        collapsedView={collapsedView}
        brackets={['(', ')']}
      >
        {child}
      </JsonCrdtObjectLayout>
    </JsonCrdtRegion>
  );
};
