import {ArrayRga} from '../../nodes/rga-array/ArrayRga';
import {ObjectLww} from '../../nodes/lww-object/ObjectLww';
import {Path, toPath} from '../../../json-pointer';
import {ArrayLww} from '../../nodes/lww-array/ArrayLww';
import type {JsonNode} from '../../nodes';

export const find = (startNode: JsonNode, path: string | Path): JsonNode => {
  const steps = toPath(path);
  let node: JsonNode | undefined = startNode;
  const length = steps.length;
  if (!length) return node;
  let i = 0;
  while (i < length && node) {
    const step = steps[i++];
    node = node.container();
    if (!node) throw new Error('NOT_CONTAINER');
    if (node instanceof ObjectLww) {
      const nextNode = node.get(String(step)) as JsonNode | undefined;
      if (!nextNode) throw new Error('NOT_FOUND');
      node = nextNode;
    } else if (node instanceof ArrayRga) {
      const nextNode = node.getNode(Number(step));
      if (!nextNode) throw new Error('NOT_FOUND');
      node = nextNode;
    } else if (node instanceof ArrayLww) {
      const nextNode = node.get(Number(step)) as JsonNode | undefined;
      if (!nextNode) throw new Error('NOT_FOUND');
      node = nextNode;
    }
  }
  return node;
};
