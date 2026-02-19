/** Direct Peritext Fragment to ProseMirror Node converter with caching. */

import * as pmm from 'prosemirror-model';
import {Block, LeafBlock, Inline, Slice} from 'json-joy/lib/json-crdt-extensions';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';

/**
 * Double-buffered cache for ProseMirror nodes, keyed by Peritext Block hash.
 * Designed to maximize reuse of unchanged nodes across renders while allowing
 * GC of stale entries without needing to track usage counts or timestamps.
 */
class PmNodeCache {
  /** Entries written/read during the *current* render pass. */
  private curr: Map<number, pmm.Node> = new Map();
  /** Entries from the *previous* render pass (read-only during current). */
  private prev: Map<number, pmm.Node> = new Map();

  /**
   * Look up a cached ProseMirror node by Peritext Block hash.
   * Automatically promotes a hit from `prev` into `curr`.
   */
  get(hash: number): pmm.Node | undefined {
    const curr = this.curr;
    let node = curr.get(hash);
    if (node !== undefined) return node;
    node = this.prev.get(hash);
    // Promote to current generation so it survives the next GC.
    if (node !== undefined) curr.set(hash, node);
    return node;
  }

  /** Store a freshly-built node. */
  set(hash: number, node: pmm.Node): void {
    this.curr.set(hash, node);
  }

  /**
   * Call once at the **end** of each render pass.
   * Drops entries that were not accessed during this render.
   */
  gc(): void {
    this.prev = this.curr;
    this.curr = new Map();
  }
}

const blockAttrs = (block: Block | LeafBlock): pmm.Attrs | null => {
  const data = block.attr();
  if (data && typeof data === 'object') for (const _ in data) return data as pmm.Attrs;
  return null;
};

/**
 * Stateful converter that turns a Peritext `Fragment` into a ProseMirror `doc`
 * Node, reusing unchanged sub-trees via {@link PmNodeCache}.
 */
export class ToPmNode {
  public readonly cache = new PmNodeCache();

  constructor(public readonly schema: pmm.Schema) {}

  /**
   * Convert a Peritext `Fragment` into a full ProseMirror document node.
   * Assumes `fragment.refresh()` has already been called so that all
   * `Block.hash` values are up-to-date.
   */
  convert(fragment: Fragment<string>): pmm.Node {
    const root = fragment.root;
    const children = root.children;
    const length = children.length;
    const pmChildren: pmm.Node[] = [];
    const cache = this.cache;
    for (let i = 0; i < length; i++) {
      const block = children[i];
      const hash = block.hash;
      const cached = cache.get(hash);
      if (cached) {
        pmChildren.push(cached);
        continue;
      }
      const pmNode = this.convBlock(block);
      cache.set(hash, pmNode);
      pmChildren.push(pmNode);
    }
    cache.gc();
    const docType = this.schema.nodes.doc;
    return docType.create(null, pmChildren);
  }

  private convBlock(block: Block | LeafBlock): pmm.Node {
    const schema = this.schema;
    const tag = block.tag();
    const typeName = tag ? tag + '' : 'paragraph';
    const nodeType = schema.nodes[typeName] ?? schema.nodes.paragraph;
    const attrs = blockAttrs(block);
    if (block instanceof LeafBlock)
      return nodeType.create(attrs, this.convInlines(block));
    const children = block.children;
    const length = children.length;
    const pmChildren: pmm.Node[] = new Array(length);
    for (let i = 0; i < length; i++)
      pmChildren[i] = this.convBlock(children[i]);
    return nodeType.create(attrs, pmChildren);
  }

  private convInlines(leaf: LeafBlock): pmm.Node[] {
    const schema = this.schema;
    const result: pmm.Node[] = [];
    for (let iterator = leaf.texts0(), inline: Inline<any> | undefined; inline = iterator();) {
      const text = inline.text();
      if (!text) continue;
      const marks = this.convMarks(inline);
      result.push(schema.text(text, marks.length ? marks : undefined));
    }
    return result;
  }

  private convMarks(inline: Inline): readonly pmm.Mark[] {
    const schema = this.schema;
    const layers = inline.p1.layers;
    const length = layers.length;
    if (!length) return pmm.Mark.none;
    const marks: pmm.Mark[] = [];
    for (let i = 0; i < length; i++) {
      const slice = layers[i];
      if (!(slice instanceof Slice)) continue;
      const tag = slice.type() + '';
      const markType = schema.marks[tag];
      if (!markType) continue;
      const data = slice.data();
      const attrs: pmm.Attrs | null =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as pmm.Attrs) : null;
      marks.push(markType.create(attrs));
    }
    return marks;
  }
}
