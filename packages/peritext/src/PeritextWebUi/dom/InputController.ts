import {unit} from '../util';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {PeritextEventTarget} from 'json-joy/lib/json-crdt-extensions/peritext/events/PeritextEventTarget';
import type {TypedEventTarget} from 'json-joy/lib/util/events/TypedEventTarget';
import type {UiLifeCycles} from '../types';
import type {DomController} from './DomController';

export interface InputControllerEventSourceMap {
  beforeinput: HTMLElementEventMap['beforeinput'];
  keydown: HTMLElementEventMap['keydown'];
  copy: HTMLElementEventMap['copy'];
  cut: HTMLElementEventMap['cut'];
  paste: HTMLElementEventMap['paste'];
}

export type InputControllerEventSource = TypedEventTarget<InputControllerEventSourceMap>;

/**
 * Processes incoming DOM "input" events (such as "beforeinput", "input",
 * "keydown", etc.) and translates them into Peritext events.
 */
export class InputController implements UiLifeCycles {
  protected readonly txt: Peritext;
  public readonly et: PeritextEventTarget;

  public constructor(protected readonly dom: DomController) {
    this.txt = dom.txt;
    this.et = dom.et;
  }

  public start() {
    const onBeforeInput = (event: InputEvent): void => {
      if (!this.dom.isEditable(event.target as Element)) return;
      // TODO: prevent default more selectively?
      const et = this.et;
      const inputType = event.inputType;
      switch (inputType) {
        case 'insertParagraph': {
          // insert a paragraph break
          event.preventDefault();
          et.marker({action: 'ins'});
          break;
        }
        // case 'insertFromComposition':
        case 'insertFromDrop':
        case 'insertFromPaste':
        case 'insertFromYank':
        case 'insertReplacementText':
        // case 'insertFromYank': { // replace the current selection with content stored in a kill buffer
        // }
        // case 'insertFromDrop': { // insert content by means of drop
        // }
        // case 'insertFromPaste': { // paste content from clipboard or paste image from client provided image library
        // }
        // case 'insertFromPasteAsQuotation': { // paste content from the clipboard as a quotation
        // }
        // case 'insertTranspose': { // transpose the last two grapheme cluster. that were entered
        // }
        // case 'insertCompositionText': { // replace the current composition string
        // }
        case 'insertText': {
          // TODO: handle `dataTransfer` Image drops, URL drops
          // TODO: handle `dataTransfer` HTML drops
          event.preventDefault();
          if (typeof event.data === 'string') {
            et.insert(event.data);
          } else {
            const dataTransfer = event.dataTransfer;
            if (dataTransfer) {
              const text = dataTransfer.getData('text/plain');
              if (text) et.insert(text);
              else dataTransfer.items[0]?.getAsString((text) => et.insert(text));
            }
          }
          break;
        }
        case 'deleteContent': {
          event.preventDefault();
          et.delete({});
          break;
        }
        case 'deleteContentBackward': {
          event.preventDefault();
          et.delete('start', 'char', -1);
          break;
        }
        case 'deleteContentForward': {
          event.preventDefault();
          et.delete('end', 'char', 1);
          break;
        }
        case 'deleteWordBackward': {
          event.preventDefault();
          et.delete('start', 'word', -1);
          break;
        }
        case 'deleteWordForward': {
          event.preventDefault();
          et.delete('end', 'word', 1);
          break;
        }
        case 'deleteHardLineBackward': {
          event.preventDefault();
          et.delete('start', 'line', -1);
          break;
        }
        case 'deleteHardLineForward': {
          event.preventDefault();
          et.delete('end', 'line', 1);
          break;
        }
        case 'deleteSoftLineBackward': {
          event.preventDefault();
          et.delete('start', 'vline', -1);
          break;
        }
        case 'deleteSoftLineForward': {
          event.preventDefault();
          et.delete('end', 'vline', 1);
          break;
        }
        case 'deleteEntireSoftLine': {
          event.preventDefault();
          et.delete({
            move: [
              ['start', 'vline', -1],
              ['end', 'vline', 1],
            ],
          });
          break;
        }
        case 'insertLineBreak': {
          event.preventDefault();
          et.insert('\n');
          break;
        }
        // case 'insertOrderedList': { // insert a numbered list
        // }
        // case 'insertUnorderedList': { // insert a bulleted list
        // }
        // case 'insertHorizontalRule': { // insert a horizontal rule
        // }
        // case 'insertLink': { // insert a link
        // }
        // case 'deleteByDrag': { // remove content from the DOM by means of drag
        // }
        case 'deleteByCut': {
          event.preventDefault();
          et.buffer({action: 'cut'});
          break;
        }
        // case 'historyUndo': {}
        // case 'historyRedo': {}
        case 'formatBold': {
          event.preventDefault();
          et.format('tog', SliceTypeName.b);
          break;
        }
        case 'formatItalic': {
          event.preventDefault();
          et.format('tog', SliceTypeName.i);
          break;
        }
        case 'formatUnderline': {
          event.preventDefault();
          et.format('tog', SliceTypeName.u);
          break;
        }
        case 'formatStrikeThrough': {
          event.preventDefault();
          et.format('tog', SliceTypeName.s);
          break;
        }
        case 'formatSuperscript': {
          event.preventDefault();
          et.format('tog', SliceTypeName.sup);
          break;
        }
        case 'formatSubscript': {
          event.preventDefault();
          et.format('tog', SliceTypeName.sub);
          break;
        }
        // case 'formatJustifyFull': { // make the current selection fully justified
        // }
        // case 'formatJustifyCenter': { // center align the current selection
        // }
        // case 'formatJustifyRight': { // right align the current selection
        // }
        // case 'formatJustifyLeft': { // left align the current selection
        // }
        // case 'formatIndent': { // indent the current selection
        // }
        // case 'formatOutdent': { // outdent the current selection
        // }
        // case 'formatRemove': { // remove all formatting from the current selection
        // }
        // case 'formatSetBlockTextDirection': { // set the text block direction
        // }
        // case 'formatSetInlineTextDirection': { // set the text inline direction
        // }
        // case 'formatBackColor': { // change the background color
        // }
        // case 'formatFontColor': { // change the font color
        // }
        // case 'formatFontName': { // change the font name
        // }
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!this.dom.isEditable(event.target as Element)) return;
      const key = event.key;
      if (event.isComposing || key === 'Dead') return;
      const et = this.et;
      switch (key) {
        case 'Backspace':
        case 'Delete': {
          const direction = key === 'Delete' ? 1 : -1;
          const deleteUnit = unit(event);
          if (deleteUnit) {
            event.preventDefault();
            et.delete('focus', deleteUnit, direction);
          }
          break;
        }
        case 'Escape': {
          // TODO: Use rendering surface imperative UI API here.
          const div = this.dom.el;
          if (div instanceof HTMLElement) {
            event.preventDefault();
            div.blur();
          }
          break;
        }
      }
    };
    const onCopy = (event: ClipboardEvent): void => {
      if (!this.dom.isEditable(event.target as Element)) return;
      event.preventDefault();
      this.et.buffer({action: 'copy'});
    };
    const onCut = (event: ClipboardEvent): void => {
      if (!this.dom.isEditable(event.target as Element)) return;
      event.preventDefault();
      this.et.buffer({action: 'cut'});
    };
    const onPaste = (event: ClipboardEvent): void => {
      if (!this.dom.isEditable(event.target as Element)) return;
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain');
      const html = event.clipboardData?.getData('text/html');
      if (text || html) {
        const data = {text, html};
        this.et.buffer({action: 'paste', data});
      }
    };
    const el = this.dom.el;
    el.addEventListener('beforeinput', onBeforeInput);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('copy', onCopy);
    el.addEventListener('cut', onCut);
    el.addEventListener('paste', onPaste);
    return () => {
      el.removeEventListener('beforeinput', onBeforeInput);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('copy', onCopy);
      el.removeEventListener('cut', onCut);
      el.removeEventListener('paste', onPaste);
    };
  }
}
