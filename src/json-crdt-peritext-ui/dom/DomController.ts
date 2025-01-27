import {printTree, type Printable} from 'tree-dump';
import {InputController} from '../dom/InputController';
import {CursorController} from '../dom/CursorController';
import {RichTextController} from '../dom/RichTextController';
import {KeyController} from '../dom/KeyController';
import {CompositionController} from '../dom/CompositionController';
import type {PeritextEventDefaults} from '../events/PeritextEventDefaults';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';
import type {PeritextRenderingSurfaceApi, UiLifeCycles} from '../dom/types';

export interface DomControllerOpts {
  source: HTMLElement;
  events: PeritextEventDefaults;
}

export class DomController implements UiLifeCycles, Printable, PeritextRenderingSurfaceApi {
  public readonly et: PeritextEventTarget;
  public readonly keys: KeyController;
  public readonly comp: CompositionController;
  public readonly input: InputController;
  public readonly cursor: CursorController;
  public readonly richText: RichTextController;

  constructor(public readonly opts: DomControllerOpts) {
    const {source, events} = opts;
    const {txt} = events;
    const et = (this.et = opts.events.et);
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

  /** ----------------------------------- {@link PeritextRenderingSurfaceApi} */

  public focus(): void {
    this.opts.source.focus();
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
