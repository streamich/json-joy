import {FanOut} from 'thingies/lib/fanout';
import type {Key} from './Key';
import {KeySourceDoc} from './KeySourceDoc';
import {KeySourceEl} from './KeySourceEl';
import {KeyMap} from './KeyMap';
import {KeySet} from './KeySet';
import {KeySequenceMatcher} from './KeySequenceMatcher';
import {printTree} from 'tree-dump/lib/printTree';
import type {Printable} from 'tree-dump';
import type {
  ChordAction,
  ChordBinding,
  ChordBindingOptions,
  ChordBindingShorthand,
  ChordSignature,
  KeyBinding,
  KeyBindingShorthand,
  KeySink,
  KeySource,
} from './types';

const enum KeyControllerConstants {
  HistoryLimit = 25,
}

export class KeyContext implements KeySink, Printable {
  /**
   * Creates a root `KeyContext` which binds to `window` and `document` key
   * events.
   *
   * @param name Provide for debugging, used in `.toString()`.
   */
  public static global(name?: string): [context: KeyContext, unbind: () => void] {
    const ctx = new KeyContext(void 0, name);
    const source = new KeySourceDoc();
    const unbind = source.bind(ctx);
    return [ctx, unbind];
  }

  public readonly onChange = new FanOut<void>();

  /** Shortcut/hotkey definition map. */
  public readonly map: KeyMap;

  /** All currently pressed keys. */
  public readonly pressed: KeySet = new KeySet();

  /** History of last N pressed keys. */
  public readonly history: Key[] = [];
  public historyLimit: number = KeyControllerConstants.HistoryLimit;

  public _child: KeyContext | undefined = void 0;
  public _feedChild: boolean = false;
  public _childUnbind?: () => void = void 0;

  /** Timeout (ms) between consecutive sequence steps. Default: 1000. */
  public seqTimeout: number = 1000;

  public readonly seqMatcher: KeySequenceMatcher;

  public constructor(
    public readonly parent: KeyContext | undefined = void 0,
    public readonly name: string = parent ? 'child' : 'root',
  ) {
    this.map = new KeyMap();
    this.seqMatcher = new KeySequenceMatcher(
      this.map.sequenceMap.root,
      this.seqTimeout,
    );
  }

  protected detachChild(): void {
    const child = this._child;
    child?.detachChild();
    this._child = void 0;
    this._childUnbind?.();
    this._childUnbind = void 0;
  }

  public child(name?: string, source?: KeySource | HTMLElement): KeyContext {
    if (this._child) this.detachChild();
    const child = new KeyContext(this, name);
    this._child = child;
    const keySource: KeySource | undefined =
      typeof HTMLElement !== 'undefined' && source instanceof HTMLElement
        ? new KeySourceEl(source)
        : typeof source === 'object' && 'bind' in source
          ? source
          : void 0;
    this._feedChild = !keySource;
    this._childUnbind = keySource?.bind(child);
    return child;
  }

  public bind(definitions: (KeyBinding | KeyBindingShorthand | ChordBinding | ChordBindingShorthand)[]): () => void {
    return this.map.bind(definitions);
  }

  public setChord(sig: ChordSignature, action: ChordAction, options?: ChordBindingOptions): void {
    this.map.setChord(sig, action, options);
  }

  public delChord(sig: ChordSignature, action: ChordAction): void {
    this.map.delChord(sig, action);
  }

  // ------------------------------------------------------- pausing / resuming

  public paused: boolean = false;

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  /** ------------------------------------------------------- {@link KeySink} */

  public onPress(press: Key): void {
    // Descend down in context chain on press.
    const child = this._child;
    if (child) {
      if (this._feedChild) {
        let leaf = child;
        while (leaf._child) leaf = leaf._child;
        leaf.onPress_(press);
      }
    } else this.onPress_(press);
  }

  /** Propagate up on press. */
  protected onPress_(press: Key): void {
    if (this.paused) return;
    const {key, event} = press;
    if (event?.isComposing || key === 'Dead') return;
    const {pressed, history} = this;
    pressed.add(press);
    history.push(press);
    while (history.length > this.historyLimit) history.shift();

    // Chord check runs first. If a chord is matched the key that completed
    // it does NOT fire its single-key binding (eager chord, silent single).
    const chordMatches = this.map.matchChord(pressed);
    if (chordMatches) {
      press.propagate = false;
      for (const match of chordMatches) {
        match.action(pressed);
        if (match.propagate) press.propagate = true;
      }
    } else {
      const matches = this.map.matchPress(press);
      if (matches) {
        press.propagate = false;
        for (const match of matches) {
          match.action(press);
          if (match.propagate) press.propagate = true;
        }
      }
    }

    // Sequence matching.
    if (!this.map.sequenceMap.isEmpty()) {
      const seqMatches = this.seqMatcher.advance(press.sig(), press.ts);
      if (seqMatches) {
        press.propagate = false;
        for (const match of seqMatches) {
          match.action();
          if (match.propagate) press.propagate = true;
        }
      }
    }

    this.onChange.emit();
    if (press.propagate) {
      const parent = this.parent;
      if (parent) parent.onPress_(press);
    }
  }

  public onRelease(release: Key): void {
    // Descend down in context chain on release.
    const child = this._child;
    if (child) {
      if (this._feedChild) {
        let leaf = child;
        while (leaf._child) leaf = leaf._child;
        leaf.onRelease_(release);
      }
    } else this.onRelease_(release);
  }

  /** Propagate up on release. */
  protected onRelease_(release: Key): void {
    this.pressed.remove(release);
    if (release.key === 'Meta') this.pressed.clearNonMods();
    if (this.paused) return;
    const {key, event} = release;
    if (event?.isComposing || key === 'Dead') return;
    const matches = this.map.matchRelease(release);
    if (matches) {
      release.propagate = false;
      for (const match of matches) {
        match.action(release);
        if (match.propagate) release.propagate = true;
      }
    }
    this.onChange.emit();
    if (release.propagate) {
      const parent = this.parent;
      if (parent) parent.onRelease_(release);
    }
  }

  public onReset(): void {
    this.pressed.reset();
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onReset();
    } else this.onReset_();
  }

  protected onReset_(): void {
    this.seqMatcher.reset();
    this.onChange.emit();
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    const child = this._child;
    return (
      'ctx (' +
      this.name +
      ')' +
      printTree(tab, [
        () => 'history: ' + this.history.map((k) => k.sig()).join(', '),
        (tab) => this.pressed.toString(tab),
        child ? (tab) => child.toString(tab) : null,
      ])
    );
  }
}
