import {expandMod} from './util';
import type {SequenceBinding, SequenceAction, SequenceBindingOptions} from './types';

export class SeqTrieNode {
  constructor(
    public children: Map<string, SeqTrieNode>,
    public bindings?: SequenceBinding[],
  ) {}
}

export class SequenceMap {
  public readonly root: SeqTrieNode = new SeqTrieNode(new Map());
  /** Length of the longest registered sequence (number of steps). */
  public maxDepth: number = 0;

  public set(sig: string, action: SequenceAction, options?: SequenceBindingOptions): void {
    const steps = sig.split(' ').map((s) => expandMod(s));
    let node = this.root;
    for (const step of steps) {
      let child = node.children.get(step);
      if (!child) {
        child = new SeqTrieNode(new Map());
        node.children.set(step, child);
      }
      node = child;
    }
    const binding: SequenceBinding = {...options, sig, action};
    (node.bindings ??= []).push(binding);
    if (steps.length > this.maxDepth) this.maxDepth = steps.length;
  }

  public del(sig: string, action: SequenceAction): void {
    const steps = sig.split(' ').map((s) => expandMod(s));
    let node = this.root;
    for (const step of steps) {
      const child = node.children.get(step);
      if (!child) return;
      node = child;
    }
    if (!node.bindings) return;
    const idx = node.bindings.findIndex((b) => b.action === action);
    if (idx !== -1) node.bindings.splice(idx, 1);
    // Note: prefix set rebuild on delete is omitted for simplicity;
    // prefixes are conservative (may contain stale entries — harmless).
  }

  public isEmpty(): boolean {
    return this.root.children.size === 0;
  }
}
