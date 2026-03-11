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

export class PeritextHeadless implements UiLifeCycles {
  public readonly registry: SliceRegistry;
  public readonly log: Log;
  public readonly transfer: PeritextDataTransfer;
  public readonly clipboard: PeritextClipboard;
  public readonly et: PeritextEventTarget;
  public readonly defaults: PeritextEventDefaults;
  public readonly cmd: PeritextCommands;
  public readonly annals: Annals;

  constructor(public readonly txt: Peritext, log: Log = Log.from(txt.model)) {
    const registry = new SliceRegistry();
    const transfer = createDataTransfer(txt, registry);
    const et = new PeritextEventTarget();
    const clipboard = new PeritextClipboardImpl(navigator.clipboard);
    const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer});
    et.defaults = defaults;
    const cmd = new PeritextCommands(txt, et);
    const annals = new Annals(log, txt, et);
    defaults.undo = annals;
    
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
    };
  }

  /** ----------------------------------------------------- {@link Printable} */
  
  public toString(tab?: string): string {
    return 'headless' + printTree(tab, [
      (tab: string) => this.registry.toString(tab),
      (tab: string) => this.annals.toString(tab),
      (tab: string) => this.txt.toString(tab),
    ]);
  }
}
