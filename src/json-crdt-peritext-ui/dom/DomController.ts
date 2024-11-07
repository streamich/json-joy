import {printTree, type Printable} from 'tree-dump';
import {InputController} from '../dom/InputController';
import {CursorController} from '../dom/CursorController';
import {RichTextController} from '../dom/RichTextController';
import {PeritextEventDefaults} from '../events/PeritextEventDefaults';
import {PeritextEventTarget} from '../events/PeritextEventTarget';
import {KeyController} from '../dom/KeyController';
import {CompositionController} from '../dom/CompositionController';
import type {UiLifeCycles} from '../dom/types';
import type {Peritext} from '../../json-crdt-extensions';

export interface DomControllerOpts {
  source: HTMLElement;
  txt: Peritext;
}

export class DomController implements UiLifeCycles, Printable {
  public readonly et: PeritextEventTarget;
  public readonly keys: KeyController;
  public readonly comp: CompositionController;
  public readonly input: InputController;
  public readonly cursor: CursorController;
  public readonly richText: RichTextController;

  constructor(public readonly opts: DomControllerOpts) {
    const {source, txt} = opts;
    const et = (this.et = new PeritextEventTarget());
    const defaults = new PeritextEventDefaults(txt, et);
    et.defaults = defaults;
    const keys = (this.keys = new KeyController({source}));
    const comp = (this.comp = new CompositionController({et, source, txt}));
    this.input = new InputController({et, source, txt, comp});
    this.cursor = new CursorController({et, source, txt, keys});
    this.richText = new RichTextController({et, source, txt});
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.keys.start();
    this.comp.start();
    this.input.start();
    this.cursor.start();
    this.richText.start();
  }

  public stop(): void {
    this.keys.stop();
    this.comp.stop();
    this.input.stop();
    this.cursor.stop();
    this.richText.stop();
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return (
      'DOM' +
      printTree(tab, [
        (tab) => this.cursor.toString(tab),
        (tab) => this.keys.toString(tab),
        (tab) => this.comp.toString(tab),
      ])
    );
  }
}
