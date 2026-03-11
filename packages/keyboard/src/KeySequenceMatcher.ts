import type {SeqTrieNode} from './SequenceMap';
import type {SequenceBinding} from './types';

export class KeySequenceMatcher {
  private cursor: SeqTrieNode;
  private buffer: string = '';
  private lastTs: number = 0;
  private timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly root: SeqTrieNode,
    private readonly timeoutMs: number = 1000,
  ) {
    this.cursor = root;
  }

  /**
   * Advance the matcher with a new key signature.
   * Returns matched bindings if a sequence completes, else undefined.
   */
  public advance(sig: string, ts: number): SequenceBinding[] | undefined {
    // Timeout — reset if too long since last step.
    if (this.buffer && ts - this.lastTs > this.timeoutMs) this.reset();
    this.lastTs = ts;

    // Try to advance the cursor.
    let next = this.cursor.children.get(sig);
    if (!next) {
      // No continuation — restart from root with this key.
      this.buffer = '';
      this.cursor = this.root;
      next = this.root.children.get(sig);
      if (!next) {
        this.reset();
        return undefined;
      }
    }

    this.cursor = next;
    this.buffer = this.buffer ? this.buffer + ' ' + sig : sig;
    this.scheduleTimeout();

    if (next.bindings?.length) {
      const result = next.bindings;
      // If this node also has children (overlapping prefix), keep cursor
      // alive for potential longer match (eager fire).
      if (next.children.size === 0) {
        this.reset();
      }
      return result;
    }

    return undefined;
  }

  /** Whether a sequence is partially matched (waiting for more input). */
  public isActive(): boolean {
    return this.buffer !== '';
  }

  /** Check if a given signature would start any known sequence. */
  public wouldStart(sig: string): boolean {
    return this.root.children.has(sig);
  }

  public reset(): void {
    this.cursor = this.root;
    this.buffer = '';
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = undefined;
  }

  private scheduleTimeout(): void {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => this.reset(), this.timeoutMs);
  }
}
