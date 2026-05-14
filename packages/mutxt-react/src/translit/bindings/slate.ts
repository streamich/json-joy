import {Editor, Range, Transforms} from 'slate';
import {Matcher} from '../Matcher';
import type {TranslitService} from '../TranslitService';

/**
 * Slate plugin: while the service has an active scheme, re-route `insertText`
 * through the matcher. Implementation notes:
 *
 * - The matcher state is recreated whenever the active scheme changes.
 * - Range selections, paste, and IME composition all bypass the matcher.
 * - The plugin does NOT gate by block type (e.g. `code-block`); the host
 *   (mutxt) wires that gate in via `shouldRun`. This keeps the binding
 *   reusable with any Slate editor.
 *
 * The plugin returns the patched editor.
 */
export interface WithTranslitOpts {
  /**
   * Optional gate. When provided and returns `false`, the matcher is bypassed
   * for this `insertText` call (e.g. inside code blocks). Defaults to `true`.
   */
  shouldRun?: (editor: Editor) => boolean;
}

export const withTranslit = <T extends Editor>(editor: T, service: TranslitService, opts: WithTranslitOpts = {}): T => {
  const {insertText, deleteBackward, insertBreak} = editor;
  let matcher: Matcher | null = null;
  let composing = false;

  const refresh = (): void => {
    const compiled = service.activeScheme();
    matcher = compiled ? new Matcher(compiled) : null;
  };
  refresh();
  service.active.subscribe(refresh);

  const shouldRun = opts.shouldRun ?? (() => true);

  editor.insertText = (text) => {
    const m = matcher;
    if (!m || composing) return insertText(text);
    const sel = editor.selection;
    if (!sel || !Range.isCollapsed(sel)) {
      m.reset();
      return insertText(text);
    }
    if (!shouldRun(editor)) return insertText(text);
    if (text.length !== 1) {
      const flushed = m.flushAndPassthrough(text);
      applyStep(editor, flushed.replaceTail, flushed.emit);
      return;
    }
    const step = m.feed(text);
    applyStep(editor, step.replaceTail, step.emit);
  };

  editor.deleteBackward = (unit) => {
    const m = matcher;
    if (m && m.buffer.length > 0) {
      // Mid-buffer: drop a buffer char and let the user proceed; do not
      // delete from the document. Keeps Backspace-during-digraph predictable.
      m.buffer = m.buffer.slice(0, -1);
      m.lastEmitLen = 0;
      return;
    }
    if (m) m.reset();
    deleteBackward(unit);
  };

  editor.insertBreak = () => {
    const m = matcher;
    if (m) {
      const flushed = m.flushBuffer();
      applyStep(editor, flushed.replaceTail, flushed.emit);
      applyFinalForm(editor, m);
      m.reset();
    }
    insertBreak();
  };

  // Caller wires composition events to these via the host's editable element.
  (editor as any).translitOnCompositionStart = () => {
    composing = true;
    matcher?.reset();
  };
  (editor as any).translitOnCompositionEnd = () => {
    composing = false;
  };
  (editor as any).translitMatcher = () => matcher;

  return editor;
};

const applyStep = (editor: Editor, replaceTail: number, emit: string): void => {
  if (!replaceTail && !emit) return;
  Editor.withoutNormalizing(editor, () => {
    if (replaceTail > 0) {
      for (let i = 0; i < replaceTail; i++) Transforms.delete(editor, {distance: 1, reverse: true, unit: 'character'});
    }
    if (emit) Transforms.insertText(editor, emit);
  });
};

const applyFinalForm = (editor: Editor, m: Matcher): void => {
  // Look at the document at the caret; if the previous char's glyph has a
  // final-form replacement, swap it in.
  const sel = editor.selection;
  if (!sel || !Range.isCollapsed(sel)) return;
  try {
    const before = Editor.before(editor, sel.anchor, {unit: 'character'});
    if (!before) return;
    const range = {anchor: before, focus: sel.anchor};
    const text = Editor.string(editor, range);
    const replacement = m.scheme.applyFinalForm(text);
    if (!replacement) return;
    Editor.withoutNormalizing(editor, () => {
      Transforms.delete(editor, {at: range});
      Transforms.insertText(editor, replacement.replacement);
    });
  } catch {}
};
