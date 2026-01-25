import * as React from 'react';
import {rule, theme, useTheme} from 'nano-theme';
import {NodeRef} from './NodeRef';
import {VecNode, type JsonNode} from 'json-joy/lib/json-crdt';

const blockClass = rule({
  ...theme.font.mono,
  fz: '10px',
  lh: '9px',
  us: 'none',
  pe: 'none',
});

export interface TypeAndIdProps {
  node: NodeRef<any>;
  active?: boolean;
  negative?: boolean;
  extension?: boolean;
}

export const TypeAndId: React.FC<TypeAndIdProps> = React.memo(({node, active, negative, extension}) => {
  const theme = useTheme();

  const crdtNode = node.node;
  let type: React.ReactNode = (crdtNode as JsonNode).name();

  if (extension) {
    if (crdtNode instanceof VecNode && crdtNode.isExt()) {
      type = (
        <span style={{whiteSpace: 'nowrap'}}>
          ext <span style={{color: theme.color.sem.brand[1]}}>{crdtNode.ext()!.name()}</span>
        </span>
      );
    }
  }

  const {sid, time} = crdtNode.id;

  return (
    <span
      className={blockClass}
      style={{color: active ? (negative ? theme.color.sem.negative[0] : theme.color.sem.blue[0]) : theme.g(0, 0.5)}}
    >
      {type}
      <span style={{color: active ? theme.g(0, 0.45) : theme.g(0, 0.2), display: 'block'}}>
        {active ? (sid > 999 ? '...' : '') + String(sid).slice(String(sid).length - 4) : null}
        <span style={{color: active ? theme.g(0, 0.7) : theme.g(0, 0.3)}}>{'.' + time}</span>
      </span>
    </span>
  );
});
