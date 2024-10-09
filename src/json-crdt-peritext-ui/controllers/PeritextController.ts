import type {Peritext} from '../../json-crdt-extensions/peritext';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';
import type {TypedEventTarget} from '../events/TypedEventTarget';
import type {UiLifeCycles} from './types';

export interface EventMap {
  beforeinput: HTMLElementEventMap['beforeinput'];
  keydown: HTMLElementEventMap['keydown'];
}

export type PeritextControllerEventSource = TypedEventTarget<EventMap>;

const unit = (event: KeyboardEvent): 'char' | 'word' | 'line' =>
  event.metaKey ? 'line' : event.altKey || event.ctrlKey ? 'word' : 'char';

export interface PeritextControllerOptions {
  source: PeritextControllerEventSource;
  txt: Peritext;
  et: PeritextEventTarget;
}

export class PeritextController implements UiLifeCycles {
  protected readonly source: PeritextControllerEventSource;
  protected readonly txt: Peritext;
  public readonly et: PeritextEventTarget;

  public constructor(options: PeritextControllerOptions) {
    this.source = options.source;
    this.txt = options.txt;
    this.et = options.et;
  }

  public start(): void {
    this.source.addEventListener('beforeinput', this.onBeforeInput);
    this.source.addEventListener('keydown', this.onKeyDown);
  }

  public stop(): void {
    this.source.removeEventListener('beforeinput', this.onBeforeInput);
    this.source.removeEventListener('keydown', this.onKeyDown);
  }

  private onBeforeInput = (event: InputEvent): void => {
    event.preventDefault();
    const inputType = event.inputType;
    const editor = this.txt.editor;
    switch (inputType) {
      case 'insertParagraph': {
        editor.saved.insMarker('p');
        editor.cursor.move(1);
        this.et.change(event);
        break;
      }
      case 'insertFromComposition':
      case 'insertFromDrop':
      case 'insertFromPaste':
      case 'insertFromYank':
      case 'insertReplacementText':
      case 'insertText': {
        if (typeof event.data === 'string') {
          this.et.insert(event.data);
        } else {
          const item = event.dataTransfer ? event.dataTransfer.items[0] : null;
          if (item) {
            item.getAsString((text) => {
              this.et.insert(text);
            });
          }
        }
        break;
      }
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key;
    const et = this.et;
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight': {
        const direction = key === 'ArrowLeft' ? -1 : 1;
        event.preventDefault();
        if (event.shiftKey) et.move(direction, unit(event), 'focus');
        else if (event.metaKey) et.move(direction, 'line');
        else if (event.altKey || event.ctrlKey) et.move(direction, 'word');
        else et.move(direction);
        break;
      }
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        const forward = key === 'Delete';
        return et.delete(forward, unit(event));
      case 'Home':
      case 'End':
        event.preventDefault();
        const direction = key === 'End' ? 1 : -1;
        const edge = event.shiftKey ? 'focus' : 'both';
        return this.et.move(direction, 'line', edge);
      case 'a':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          this.et.cursor({at: 0, len: 'all'});
          return;
        }
    }
  };
}
