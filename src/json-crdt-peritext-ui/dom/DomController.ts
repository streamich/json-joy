import {printTree, type Printable} from 'tree-dump';
import {InputController} from './InputController';
import {CursorController} from './CursorController';
import {RichTextController} from './RichTextController';
import {KeyController} from './KeyController';
import {CompositionController} from './CompositionController';
import {UndoRedoController} from './undo/UndoRedoController';
import type {PeritextEventDefaults} from '../events/defaults/PeritextEventDefaults';
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
  public readonly undo: UndoRedoController;

  constructor(public readonly opts: DomControllerOpts) {
    const {source, events} = opts;
    const {txt} = events;
    const et = (this.et = opts.events.et);
    const keys = (this.keys = new KeyController({source}));
    const comp = (this.comp = new CompositionController({et, source, txt}));
    this.input = new InputController({et, source, txt, comp});
    this.cursor = new CursorController({et, source, txt, keys});
    this.richText = new RichTextController({et, source, txt});
    this.undo = new UndoRedoController({txt});
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.keys.start();
    this.comp.start();
    this.input.start();
    this.cursor.start();
    this.richText.start();
    this.undo.start();
  }

  public stop(): void {
    this.keys.stop();
    this.comp.stop();
    this.input.stop();
    this.cursor.stop();
    this.richText.stop();
    this.undo.stop();
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
