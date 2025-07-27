import type {CompactSplitOp, OPCODE_SPLIT} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationSplit, SlateNode, SlateTextNode, SlateElementNode} from '../types';
import {find, isObjectReference, isArrayReference, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {isTextNode, isElementNode} from '../util';
import {OPCODE} from '../constants';

type Composable = string | number | SlateNode;

/**
 * @category JSON Patch Extended
 */
export class OpSplit extends AbstractOp<'split'> {
  constructor(
    path: Path,
    public readonly pos: number,
    public readonly props: object | null,
  ) {
    super(path);
  }

  public op() {
    return 'split' as const;
  }

  public code() {
    return OPCODE.split;
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.val === undefined) throw new Error('NOT_FOUND');
    const tuple = this.split(ref.val);
    if (isObjectReference(ref)) ref.obj[ref.key] = tuple;
    else if (isArrayReference(ref)) {
      ref.obj[ref.key] = tuple[0];
      ref.obj.splice(ref.key + 1, 0, tuple[1]);
    } else doc = tuple;
    return {doc, old: ref.val};
  }

  private split<T>(node: T): [T | Composable, T | Composable] {
    if (typeof node === 'string') {
      const {pos, props} = this;
      const before = node.slice(0, pos);
      const after = node.slice(pos);
      if (!props) return [before, after];
      const textNodes: [SlateTextNode, SlateTextNode] = [
        {
          ...props,
          text: before,
        },
        {
          ...props,
          text: after,
        },
      ];
      return textNodes;
    } else if (isTextNode(node)) {
      const {pos, props} = this;
      const before = node.text.slice(0, pos);
      const after = node.text.slice(pos);
      const textNodes: [SlateTextNode, SlateTextNode] = [
        {
          ...node,
          ...props,
          text: before,
        },
        {
          ...node,
          ...props,
          text: after,
        },
      ];
      return textNodes;
    } else if (isElementNode(node)) {
      const {pos, props} = this;
      const before = node.children.slice(0, pos);
      const after = node.children.slice(pos);
      const elementNodes: [SlateElementNode, SlateElementNode] = [
        {
          ...node,
          ...props,
          children: before,
        },
        {
          ...node,
          ...props,
          children: after,
        },
      ];
      return elementNodes;
    } else if (typeof node === 'number') {
      const {pos} = this;
      return [pos, node - pos];
    } else return [node, node];
  }

  public toJson(parent?: AbstractOp): OperationSplit {
    const op: OperationSplit = {
      op: 'split',
      path: formatJsonPointer(this.path),
      pos: this.pos,
    };
    if (this.props) op.props = this.props;
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactSplitOp {
    const opcode: OPCODE_SPLIT = verbose ? 'split' : OPCODE.split;
    return this.props ? [opcode, this.path, this.pos, this.props] : [opcode, this.path, this.pos];
  }
}
