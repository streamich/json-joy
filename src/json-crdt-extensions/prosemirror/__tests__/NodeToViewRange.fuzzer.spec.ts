import { s } from "../../../json-crdt-patch";
import { ModelWithExt as Model, ext } from "../../ModelWithExt";
import { NodeToViewRange } from "../NodeToViewRange";
import { node1 } from "./fixtures";
import { Node, Schema } from "prosemirror-model";
import { Fuzzer } from '@jsonjoy.com/util/lib/Fuzzer';
import { schema, doc, blockquote, ul, ol, li, p, pre, h1, h2, h3, em, strong, MarkBuilder, a} from "prosemirror-test-builder";
import {block} from "very-small-parser/lib/markdown";
import {RandomJson} from "@jsonjoy.com/util/lib/json-random";

class NodeToViewRangeFuzzer {
  public static readonly doc = () => new NodeToViewRangeFuzzer().createDocumentNode();

  private fuzzer = new Fuzzer();

  private nodeCount = 0;
  private maxNodeCount = 100;

  doContinue(percent = 50): boolean {
    if (this.nodeCount >= this.maxNodeCount) return false;
    return this.fuzzer.randomInt(1, 100) <= percent;
  }

  createInlineNode(): ReturnType<MarkBuilder> {
    const builder = this.fuzzer.pick([
      em,
      strong,
      a,
    ]);
    this.nodeCount++;
    return builder(...this.createInlineFragment());
  }

  createInlineFragment(percent = 90): (ReturnType<MarkBuilder> | string)[] {
    const nodes: (ReturnType<MarkBuilder> | string)[] = [];
    while (this.doContinue(percent)) {
      percent = Math.max(0, percent - 10);
      if (this.doContinue()) {
        this.nodeCount++;
        nodes.push(RandomJson.genString(5));
        continue;
      }
      nodes.push(this.createInlineNode());
    }
    return nodes
  }

  createBlockFragment(percent = 60): Node[] {
    const nodes: Node[] = [];
    while (this.doContinue(percent)) {
      const node = this.fuzzer.pick([
        () => this.createLeafBlockNode(),
        () => this.createContainerBlockNode(),
      ]);
      nodes.push(node());
    }
    return nodes
  }

  createListFragment(percent = 50): Node[] {
    const nodes: Node[] = [];
    while (this.doContinue(percent)) {
      percent = Math.max(0, percent - 10);
      this.nodeCount++;
      nodes.push(li(...this.createBlockFragment()));
    }
    return nodes
  }

  createLeafBlockNode(): Node {
    const builder = this.fuzzer.pick([
      p,
      pre,
      h1,
      h2,
      h3,
    ]);
    this.nodeCount++;
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

test('...', () => {
  const doc = NodeToViewRangeFuzzer.doc();
  const viewRange = NodeToViewRange.convert(doc);

  console.log(JSON.stringify(doc.toJSON(), null, 2));
  // console.log(JSON.stringify(viewRange, null, 2));

  const model = Model.create(ext.prosemirror.new());
  const prosemirror = model.s.toExt();
  prosemirror.node.txt.editor.import(0, viewRange);
  prosemirror.node.txt.refresh();
  const view = prosemirror.view();
  expect(view).toEqual(doc.toJSON());
});
