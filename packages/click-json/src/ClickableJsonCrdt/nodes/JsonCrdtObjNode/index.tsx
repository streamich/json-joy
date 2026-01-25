import * as React from 'react';
import {ConNode, type JsonNode, type ObjNode} from 'json-joy/lib/json-crdt';
import * as css from '../../../css';
import {useJsonCrdt} from '../../context';
import {NodeRef, nodeRef} from '../../NodeRef';
import {JsonCrdtRegion} from '../../JsonCrdtRegion';
import {JsonCrdtProperty} from '../../JsonCrdtProperty';
import {JsonCrdtObjectLayout} from '../../JsonCrdtObjectLayout';
import {useRerender} from '../../hooks';
import {AddKey} from './AddKey';
import {Tombstones} from './Tombstones';
import {useStyles} from '../../../context/style';

const isTombstone = (node: JsonNode) => node instanceof ConNode && node.val === undefined;

export interface JsonCrdtObjNodeProps {
  node: NodeRef<ObjNode>;
}

export const JsonCrdtObjNode: React.FC<JsonCrdtObjNodeProps> = ({node}) => {
  const {readonly} = useStyles();
  const {render} = useJsonCrdt();
  useRerender(node);

  const entries: React.ReactNode[] = [];
  const tombstones: React.ReactNode[] = [];

  node.node.nodes((child, key) => {
    if (!child) return;
    const childRef = nodeRef(child, node, key);
    if (!childRef) return;
    const element = (
      <span key={key} className={css.line}>
        {render(childRef)}
      </span>
    );
    if (isTombstone(child)) tombstones.push(element);
    else entries.push(element);
  });

  return (
    <JsonCrdtRegion node={node}>
      <JsonCrdtObjectLayout
        node={node}
        property={<JsonCrdtProperty node={node} />}
        collapsedView={!!entries.length && entries.length}
      >
        {entries}
        {!readonly && <AddKey node={node} />}
        {!!tombstones.length && <Tombstones tombstones={tombstones} />}
      </JsonCrdtObjectLayout>
    </JsonCrdtRegion>
  );
};
