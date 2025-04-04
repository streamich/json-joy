import {unit} from '../util';
import type {Peritext} from '../../../json-crdt-extensions/peritext';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {TypedEventTarget} from '../../../util/events/TypedEventTarget';
import type {CompositionController} from './CompositionController';
import type {UiLifeCycles} from '../types';

export interface InputControllerEventSourceMap {
  beforeinput: HTMLElementEventMap['beforeinput'];
  keydown: HTMLElementEventMap['keydown'];
  copy: HTMLElementEventMap['copy'];
  cut: HTMLElementEventMap['cut'];
  paste: HTMLElementEventMap['paste'];
}

export type InputControllerEventSource = TypedEventTarget<InputControllerEventSourceMap>;

export interface InputControllerOpts {
  source: InputControllerEventSource;
  txt: Peritext;
  et: PeritextEventTarget;
  comp: CompositionController;
}

/**
 * Processes incoming DOM "input" events (such as "beforeinput", "input",
 * "keydown", etc.) and translates them into Peritext events.
 */
export class InputController implements UiLifeCycles {
  protected readonly source: InputControllerEventSource;
  protected readonly txt: Peritext;
  public readonly et: PeritextEventTarget;

  public constructor(protected readonly opts: InputControllerOpts) {
    this.source = opts.source;
    this.txt = opts.txt;
    this.et = opts.et;
  }

  public start() {
    const onBeforeInput = (event: InputEvent): void => {
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
        case 'insertReplacementText': // insert or replace existing text by means of a spell checker, auto-correct, writing suggestions or similar
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
        case 'deleteContentBackward': // delete the content directly before the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its start after the deletion
        case 'deleteContent': {
          // delete the selection without specifying the direction of the deletion and this intention is not covered by another inputType
          event.preventDefault();
          et.delete(-1, 'char');
          break;
        }
        case 'deleteContentForward': {
          // delete the content directly after the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its end after the deletion
          event.preventDefault();
          et.delete(1, 'char');
          break;
        }
        case 'deleteWordBackward': {
          // delete a word directly before the caret position
          event.preventDefault();
          et.delete(-1, 'word');
          break;
        }
        case 'deleteWordForward': {
          // delete a word directly after the caret position
          event.preventDefault();
          et.delete(1, 'word');
          break;
        }
        case 'deleteSoftLineBackward': {
          // delete from the caret to the nearest visual line break before the caret position
          et.delete(-1, 'line');
          break;
        }
        case 'deleteSoftLineForward': {
          // delete from the caret to the nearest visual line break after the caret position
          et.delete(1, 'line');
          break;
        }
        case 'deleteEntireSoftLine': // delete from the nearest visual line break before the caret position to the nearest visual line break after the caret position
        case 'deleteHardLineBackward': // delete from the caret to the nearest beginning of a block element or br element before the caret position
        case 'deleteHardLineForward': {
          // delete from the caret to the nearest end of a block element or br element after the caret position
          et.delete(-1, 'word');
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
        // case 'insertLink': { // insert a link
        // }
        // case 'deleteByDrag': { // remove content from the DOM by means of drag
        // }
        // case 'deleteByCut': { // remove the current selection as part of a cut
        // }
        // case 'historyUndo': { // undo the last editing action
        // }
        // case 'historyRedo': { // to redo the last undone editing action
        // }
        // case 'formatBold': { // initiate bold text
        // }
        // case 'formatItalic': { // initiate italic text
        // }
        // case 'formatUnderline': { // initiate underline text
        // }
        // case 'formatStrikeThrough': { // initiate stricken through text
        // }
        // case 'formatSuperscript': { // initiate superscript text
        // }
        // case 'formatSubscript': { // initiate subscript text
        // }
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
            et.delete(direction, deleteUnit);
          }
          break;
        }
        case 'Escape': {
          const div = this.opts.source;
          if (div instanceof HTMLElement) {
            event.preventDefault();
            div.blur();
          }
          break;
        }
      }
    };
    const onCopy = (event: ClipboardEvent): void => {
      event.preventDefault();
      this.et.buffer({action: 'copy'});
    };
    const onCut = (event: ClipboardEvent): void => {
      event.preventDefault();
      this.et.buffer({action: 'cut'});
    };
    const onPaste = (event: ClipboardEvent): void => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain');
      const html = event.clipboardData?.getData('text/html');
      if (text || html) {
        const data = {text, html};
        this.et.buffer({action: 'paste', data});
      }
    };
    const el = this.opts.source;
    (el as any).contentEditable = 'true';
    el.addEventListener('beforeinput', onBeforeInput);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('copy', onCopy);
    el.addEventListener('cut', onCut);
    el.addEventListener('paste', onPaste);
    return () => {
      (el as any).contentEditable = 'false';
      el.removeEventListener('beforeinput', onBeforeInput);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('copy', onCopy);
      el.removeEventListener('cut', onCut);
      el.removeEventListener('paste', onPaste);
    };
  }
}
