import {KeyContext} from '@jsonjoy.com/keyboard';
import {PeritextEventDefaults} from './events/defaults/PeritextEventDefaults';
import {SliceRegistry} from './registry/SliceRegistry';
import {PeritextEventTarget} from './events/PeritextEventTarget';
import {PeritextClipboardImpl} from './events/clipboard/PeritextClipboardImpl';
import {create as createDataTransfer} from './transfer/create';
import {PeritextCommands} from './commands/PeritextCommands';
import {Annals} from './annals/Annals';
import {printTree, type Printable} from 'tree-dump';
import {Log} from '../../json-crdt/log/Log';
import type {UiLifeCycles} from './types';
import type {PeritextDataTransfer} from './transfer/PeritextDataTransfer';
import type {Peritext} from './Peritext';
import type {PeritextClipboard} from './events/clipboard/types';

export interface PeritextHeadlessOpts {
  log?: Log;
  kbd?: KeyContext;
}

export class PeritextHeadless implements UiLifeCycles {
  public readonly registry: SliceRegistry;
  public readonly log: Log;
  public readonly transfer: PeritextDataTransfer;
  public readonly clipboard: PeritextClipboard;
  public readonly et: PeritextEventTarget;
  public readonly defaults: PeritextEventDefaults;
  public readonly cmd: PeritextCommands;
  public readonly annals: Annals;
  public readonly kbd: KeyContext;

  private _kbdUnbind?: () => void = void 0;

  constructor(public readonly txt: Peritext, opts: PeritextHeadlessOpts = {}) {
    const {
      log = Log.from(txt.model),
    } = opts;
    const registry = new SliceRegistry();
    const transfer = createDataTransfer(txt, registry);
    const et = new PeritextEventTarget();
    const clipboard = new PeritextClipboardImpl(navigator.clipboard);
    const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer});
    et.defaults = defaults;
    const cmd = new PeritextCommands(txt, et);
    const annals = new Annals(log, txt, et);
    defaults.undo = annals;
    let {kbd} = opts;
    if (kbd) {
      kbd = kbd.child('peritext-headless');
      this._kbdUnbind = () => kbd!.dispose();
    } else {
      const [kbd0, unbindSource] = KeyContext.global('peritext-headless', {filter: 'no-inputs'});
      kbd = kbd0;
      this._kbdUnbind = () => {
        unbindSource();
        kbd0.dispose();
      };
    }
    kbd!.focus();
    this.kbd = kbd;
    
    this.log = log;
    this.registry = registry;
    this.transfer = transfer;
    this.et = et;
    this.clipboard = clipboard;
    this.defaults = defaults;
    this.cmd = cmd;
    this.annals = annals;
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const stopAnnals = this.annals.start();
    return () => {
      stopAnnals();
      this._kbdUnbind?.();
    };
  }

  /** ----------------------------------------------------- {@link Printable} */
  
  public toString(tab?: string): string {
    return 'Headless' + printTree(tab, [
      (tab: string) => this.registry.toString(tab),
      (tab: string) => this.annals.toString(tab),
      (tab: string) => this.kbd.toString(tab),
      (tab: string) => this.txt.toString(tab),
    ]);
  }
}
