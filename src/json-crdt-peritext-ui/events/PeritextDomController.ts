import {InputController} from "../dom/InputController";
import {SelectionController} from "../dom/SelectionController";
import {RichTextController} from "../dom/RichTextController";
import {PeritextEventDefaults} from "./PeritextEventDefaults";
import {PeritextEventTarget} from "./PeritextEventTarget";
import {KeyController} from "../dom/KeyController";
import type {UiLifeCycles} from '../dom/types';
import type {Peritext} from "../../json-crdt-extensions";

export interface PeritextDomControllerOpts {
  source: HTMLElement;
  txt: Peritext;
}

export class PeritextDomController implements UiLifeCycles {
  public readonly et: PeritextEventTarget;
  public readonly keys: KeyController;
  public readonly input: InputController;
  public readonly selection: SelectionController;
  public readonly richText: RichTextController;
  
  constructor(public readonly opts: PeritextDomControllerOpts) {
    const {source, txt} = opts;
    const et = this.et = new PeritextEventTarget();
    const defaults = new PeritextEventDefaults(txt, et);
    et.defaults = defaults;
    const keys = this.keys = new KeyController();
    this.input = new InputController({et, source, txt});
    this.selection = new SelectionController({et, source, txt, keys});
    this.richText = new RichTextController({et, source, txt});
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.keys.start();
    this.input.start();
    this.selection.start();
    this.richText.start();
  }
  
  public stop(): void {
    this.keys.stop();
    this.input.stop();
    this.selection.stop();
    this.richText.stop();
  }
}
