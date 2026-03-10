import {PeritextEventDefaults} from './events/defaults/PeritextEventDefaults';
import {SliceRegistry} from './registry/SliceRegistry';
import {PeritextEventTarget} from './events/PeritextEventTarget';
import {PeritextClipboardImpl} from './events/clipboard/PeritextClipboardImpl';
import {create as createDataTransfer} from './transfer/create';
import {PeritextCommands} from './commands/PeritextCommands';
import type {PeritextDataTransfer} from './transfer/PeritextDataTransfer';
import type {Peritext} from './Peritext';
import type {PeritextClipboard} from './events/clipboard/types';

export class PeritextHeadless {
  public readonly registry: SliceRegistry;
  public readonly transfer: PeritextDataTransfer;
  public readonly clipboard: PeritextClipboard;
  public readonly et: PeritextEventTarget;
  public readonly defaults: PeritextEventDefaults;
  public readonly cmd: PeritextCommands;

  constructor (public readonly txt: Peritext) {
    const registry = new SliceRegistry();
    const transfer = createDataTransfer(txt, registry);
    const et = new PeritextEventTarget();
    const clipboard = new PeritextClipboardImpl(navigator.clipboard);
    const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer});
    et.defaults = defaults;
    const cmd = new PeritextCommands(txt, et);

    this.registry = registry;
    this.transfer = transfer;
    this.et = et;
    this.clipboard = clipboard;
    this.defaults = defaults;
    this.cmd = cmd;
  }
}
