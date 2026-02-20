/**
 * Direct Peritext `Fragment` to Slate `Descendant[]` converter with caching.
 *
 * Implements a double-buffered cache keyed by Peritext `Block.hash`, which lets
 * unchanged sub-trees be reused across renders so that React's reconciler can
 * skip re-rendering unchanged components.
 */

import {Slice} from 'json-joy/lib/json-crdt-extensions/peritext/slice/Slice';
import {Block, LeafBlock, Inline} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import type {SlateDocument, SlateElementNode, SlateTextNode} from '../types';

/**
 * Double-buffered cache for Slate element nodes, keyed by Peritext Block hash.
 * Entries that are not accessed during the current render pass are dropped at
 * the next {@link SlateNodeCache.gc} call.
 */
class SlateNodeCache {
  /** Entries written/read during the *current* render pass. */
  private curr: Map<number, SlateElementNode> = new Map();
  /** Entries from the *previous* render pass (read-only during current). */
  private prev: Map<number, SlateElementNode> = new Map();

  get(hash: number): SlateElementNode | undefined {
    const curr = this.curr;
    let node = curr.get(hash);
    if (node !== undefined) return node;
    node = this.prev.get(hash);
    if (node !== undefined) curr.set(hash, node);
    return node;
  }

  set(hash: number, node: SlateElementNode): void {
    this.curr.set(hash, node);
  }

  /** Call once at the **end** of each render pass. Drops entries not accessed
   * during this render. */
  gc(): void {
    this.prev = this.curr;
    this.curr = new Map();
  }
}

/**
 * Stateful converter that turns a Peritext `Fragment` into a Slate
 * `Descendant[]` document, reusing unchanged sub-trees via {@link SlateNodeCache}.
 *
 * Because unchanged blocks return the **same object reference**, React's
 * reconciler (and Slate's `onChange` diffing) can skip re-rendering them.
 */
export class ToSlateNode {
  public readonly cache = new SlateNodeCache();

  convert(fragment: Fragment<string>): SlateDocument {
    const root = fragment.root;
    const blockChildren = root.children;
    const length = blockChildren.length;
    const result: SlateElementNode[] = [];
    const cache = this.cache;
    for (let i = 0; i < length; i++) {
      const block = blockChildren[i];
      const cached = cache.get(block.hash);
      if (cached) {
        result.push(cached);
        continue;
      }
      const node = this.convBlock(block);
      result.push(node);
    }
    cache.gc();
    return result;
  }

  private convBlock(block: Block | LeafBlock): SlateElementNode {
    const hash = block.hash;
    const cached = this.cache.get(hash);
    if (cached) return cached;
    const node = this.buildBlock(block);
    this.cache.set(hash, node);
    return node;
  }

  private buildBlock(block: Block | LeafBlock): SlateElementNode {
    if (block instanceof LeafBlock) {
      const textChildren: SlateTextNode[] = [];
      for (let iterator = block.texts0(), inline: Inline | undefined; (inline = iterator()); ) {
        const text = inline.text();
        const attr = inline.attr();
        const attrKeys = Object.keys(attr);
        if (!text && attrKeys.length === 0) continue;
        const textNode: SlateTextNode = {text: text || ''};
        const length = attrKeys.length;
        ATTRS: for (let i = 0; i < length; i++) {
          const tag = attrKeys[i];
          const stack = attr[tag];
          if (!stack || stack.length <= 0) continue ATTRS;
          const slice = stack[0].slice;
          if (!(slice instanceof Slice)) continue ATTRS;
          const data = slice.data();
          if (data && typeof data === 'object' && !Array.isArray(data)) Object.assign(textNode, {[tag]: data});
          else textNode[tag] = data !== undefined ? data : true;
        }
        textChildren.push(textNode);
      }
      const node: SlateElementNode = {
        type: block.tag() + '',
        children: textChildren.length ? textChildren : [{text: ''}],
      };
      const attr = block.attr();
      if (attr && typeof attr === 'object') Object.assign(node, attr);
      return node;
    } else {
      const childBlocks = block.children;
      const len = childBlocks.length;
      const children: SlateElementNode[] = new Array(len);
      for (let i = 0; i < len; i++) children[i] = this.convBlock(childBlocks[i]);
      const attr = block.attr();
      const node: SlateElementNode = {
        ...(attr && typeof attr === 'object' ? attr : {}),
        type: block.tag() + '',
        children: len ? children : [{text: ''}],
      };
      return node;
    }
  }
}
