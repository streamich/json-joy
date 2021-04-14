import {DeleteOperation} from '../../../../json-crdt-patch/operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../../../../json-crdt-patch/operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from '../../../../json-crdt-patch/operations/InsertStringSubstringOperation';
import {SetObjectKeysOperation} from '../../../../json-crdt-patch/operations/SetObjectKeysOperation';
import {JsonNode} from '../../../types';
import {StringType} from '../../../types/rga-string/StringType';
import {Model} from '../../Model';
import {FuzzerOptions} from './types';

type StringOp = (typeof InsertStringSubstringOperation) | (typeof DeleteOperation);
type ArrayOp = (typeof InsertArrayElementsOperation) | (typeof DeleteOperation);
type ObjectOp = (typeof SetObjectKeysOperation) | (typeof DeleteOperation);

export class Picker {
  constructor(public opts: FuzzerOptions) {}

  public pickNode(model: Model): JsonNode | null {
    const [, ...sessions] = [...model.nodes.entries.keys()];
    if (!sessions.length) return null;
    const sessionId = sessions[Math.floor(Math.random() * sessions.length)];
    const map = model.nodes.entries.get(sessionId)!;
    const nodeCount = map.size;
    const index = Math.floor(Math.random() * nodeCount);
    let pos = 0;
    for (const node of map.values()) {
      if (pos === index) return node;
      pos++;
    }
    return null;
  }

  public pickStringOperation(node: StringType): StringOp {
    const length = node.length();
    if (!length) return InsertStringSubstringOperation;
    if (length >= this.opts.maxStringLength) return DeleteOperation;
    if (Math.random() < this.opts.stringDeleteProbability) return DeleteOperation;
    return InsertStringSubstringOperation;
  }
}