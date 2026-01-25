import * as React from 'react';
import {context as crdt} from './context';
import {StyleContextValue, context as styles} from '../context/style';
import {NodeRef, nodeRef} from './NodeRef';
import {Root} from '../Root';
import {FocusProvider, FocusProviderProps} from '../context/focus';
import {
  ConNode,
  ValNode,
  type JsonNode,
  type Model,
  ObjNode,
  VecNode,
  ArrNode,
  StrNode,
  BinNode,
} from 'json-joy/lib/json-crdt';
import {JsonCrdtConNode} from './nodes/JsonCrdtConNode';
import {JsonCrdtValNode} from './nodes/JsonCrdtValNode';
import {JsonCrdtObjNode} from './nodes/JsonCrdtObjNode';
import {JsonCrdtVecNode} from './nodes/JsonCrdtVecNode';
import {JsonCrdtArrNode} from './nodes/JsonCrdtArrNode';
import {JsonCrdtStrNode} from './nodes/JsonCrdtStrNode';
import {JsonCrdtBinNode} from './nodes/JsonCrdtBinNode';

const render = (node: NodeRef<JsonNode>): React.ReactNode => {
  if (node.node instanceof ConNode) return <JsonCrdtConNode node={node as NodeRef<ConNode>} />;
  if (node.node instanceof ValNode) return <JsonCrdtValNode node={node as NodeRef<ValNode>} />;
  if (node.node instanceof ObjNode) return <JsonCrdtObjNode node={node as NodeRef<ObjNode>} />;
  if (node.node instanceof StrNode) return <JsonCrdtStrNode node={node as NodeRef<StrNode>} />;
  if (node.node instanceof VecNode) return <JsonCrdtVecNode node={node as NodeRef<VecNode>} />;
  if (node.node instanceof ArrNode) return <JsonCrdtArrNode node={node as NodeRef<ArrNode>} />;
  if (node.node instanceof BinNode) return <JsonCrdtBinNode node={node as NodeRef<BinNode>} />;
  return '∅';
};

export interface ClickableJsonCrdtProps extends StyleContextValue, Pick<FocusProviderProps, 'onFocus'> {
  /**
   * The JSON CRDT model to display.
   */
  model: Model<any>;

  /**
   * Whether to display the root node.
   */
  showRoot?: boolean;
}

export const ClickableJsonCrdt: React.FC<ClickableJsonCrdtProps> = (props) => {
  const {model, compact, readonly, showRoot, onFocus} = props;
  const [reset, setReset] = React.useState(0);
  React.useEffect(() => {
    const unsubscribe = model.api.onReset.listen(() => setReset((r) => r + 1));
    return () => unsubscribe();
  }, [model]);
  const node = React.useMemo(() => nodeRef(showRoot ? model.root : model.root.node(), null, ''), [model, reset]);

  return (
    <styles.Provider value={{compact, readonly}}>
      <crdt.Provider value={{model, render}}>
        <FocusProvider onFocus={onFocus}>{!!node && <Root key={reset}>{render(node)}</Root>}</FocusProvider>
      </crdt.Provider>
    </styles.Provider>
  );
};
