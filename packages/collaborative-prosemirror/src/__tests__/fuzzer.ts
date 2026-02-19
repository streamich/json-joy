import type {Node} from 'prosemirror-model';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {
  doc,
  blockquote,
  ul,
  ol,
  li,
  p,
  pre,
  h1,
  h2,
  h3,
  em,
  strong,
  type MarkBuilder,
  a,
} from 'prosemirror-test-builder';
import {RandomJson} from '@jsonjoy.com/json-random';

export class NodeToViewRangeFuzzer {
  public static readonly doc = () => new NodeToViewRangeFuzzer().createDocumentNode();

  private fuzzer = new Fuzzer();

  private nodeCount = 0;
  private maxNodeCount = 100;

  doContinue(percent = 50): boolean {
    if (this.nodeCount >= this.maxNodeCount) return false;
    return this.fuzzer.randomInt(1, 100) <= percent;
  }

  createInlineNode(): ReturnType<MarkBuilder> {
    const builder = this.fuzzer.pick([em, strong, a]);
    this.nodeCount++;
    if (builder === a) {
      return a({href: RandomJson.genString(4)}, ...this.createInlineFragment());
    } else {
      return builder(...this.createInlineFragment());
    }
  }

  createInlineFragment(percent = 90): (ReturnType<MarkBuilder> | string)[] {
    const nodes: (ReturnType<MarkBuilder> | string)[] = [];
    const count = Fuzzer.randomInt(1, 5);
    for (let i = 0; i < count; i++) {
      if (!this.doContinue()) {
        this.nodeCount++;
        nodes.push(RandomJson.genString(5));
        break;
      } else {
        nodes.push(this.createInlineNode());
      }
    }
    return nodes;
  }

  createBlockFragment(percent = 60): Node[] {
    const nodes: Node[] = [];
    while (this.doContinue(percent)) {
      const node = this.fuzzer.pick([() => this.createLeafBlockNode(), () => this.createContainerBlockNode()]);
      nodes.push(node());
    }
    return nodes;
  }

  createListFragment(percent = 50): Node[] {
    const nodes: Node[] = [];
    while (this.doContinue(percent)) {
      percent = Math.max(0, percent - 10);
      this.nodeCount++;
      nodes.push(li(...this.createBlockFragment()));
    }
    return nodes;
  }

  createLeafBlockNode(): Node {
    const builder = this.fuzzer.pick([p, pre, h1, h2, h3]);
    this.nodeCount++;
    // code_block (pre) disallows marks — use plain text only.
    if (builder === pre) return pre(RandomJson.genString(8));
    return builder(...this.createInlineFragment());
  }

  createContainerBlockNode(): Node {
    const builder = this.fuzzer.pick([blockquote, ul, ol]);
    return builder === ul || builder === ol
      ? builder(...this.createListFragment())
      : builder(...this.createBlockFragment());
  }

  createDocumentNode(): Node {
    return doc(...this.createBlockFragment(100));
  }
}
