import * as React from 'react';
import {useT} from 'use-t';
import * as css from '../../../css';
import {useJsonCrdt} from '../../context';
import {NodeRef, nodeRef} from '../../NodeRef';
import {JsonCrdtRegion} from '../../JsonCrdtRegion';
import {JsonCrdtProperty} from '../../JsonCrdtProperty';
import {JsonCrdtObjectLayout} from '../../JsonCrdtObjectLayout';
import {useRerenderModel} from '../../hooks';
import {PushElement} from './PushElement';
import {useStyles} from '../../../context/style';
import {JsonCrdtExtNode} from './JsonCrdtExtNode';
import type {VecNode} from 'json-joy/lib/json-crdt';
import {SwitchAction} from '../../../buttons/Action/SwitchAction';

export interface JsonCrdtVecNodeProps {
  node: NodeRef<VecNode>;
}

export const JsonCrdtVecNode: React.FC<JsonCrdtVecNodeProps> = ({node}) => {
  const [t] = useT();
  const [renderExtAsVec, setRenderExtAsVec] = React.useState(false);
  const {readonly} = useStyles();
  const {render} = useJsonCrdt();
  useRerenderModel();

  const isExtension = node.node.isExt();

  if (isExtension && !renderExtAsVec) {
    return <JsonCrdtExtNode node={node} onViewChange={() => setRenderExtAsVec(true)} />;
  }

  const entries: React.ReactNode[] = [];
  let i = 0;

  node.node.children((child) => {
    if (!child) return;
    const childRef = nodeRef(child, node, String(i));
    if (!childRef) return;
    entries.push(
      <span key={child.id.sid + '.' + child.id.time} className={css.line}>
        {render(childRef)}
      </span>,
    );
    i++;
  });

  return (
    <JsonCrdtRegion
      node={node}
      toolbar={
        isExtension ? (
          <SwitchAction onClick={() => setRenderExtAsVec(false)} tooltip={t('Show "ext" view')} />
        ) : undefined
      }
    >
      <JsonCrdtObjectLayout
        node={node}
        property={<JsonCrdtProperty node={node} />}
        collapsedView={!!entries.length && entries.length}
        brackets={['[', ']']}
        header={<span style={{opacity: 0.5, display: 'inline-block', margin: '0.25em 0 0 -0.3em'}}>→</span>}
      >
        {entries}
        {!readonly && <PushElement node={node} />}
      </JsonCrdtObjectLayout>
    </JsonCrdtRegion>
  );
};
