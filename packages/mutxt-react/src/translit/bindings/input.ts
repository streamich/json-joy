import {Matcher} from '../Matcher';
import type {TranslitService} from '../TranslitService';

/**
 * Bind translit to a plain `<input>` or `<textarea>` element.
 *
 * Returns a teardown function. Engages whenever the service has an active
 * scheme; idle when the service is off (no overhead).
 *
 * Caveats:
 * - We process `beforeinput` events with `inputType === 'insertText'`. Other
 *   inputs (paste, drag, IME composition) flow through unmodified. The
 *   matcher is reset on selection changes and on composition start/end.
 * - The element must allow programmatic value mutation (no read-only inputs).
 */
export const bindTranslitToInput = (
  el: HTMLInputElement | HTMLTextAreaElement,
  service: TranslitService,
): (() => void) => {
  let matcher: Matcher | null = null;
  let composing = false;

  const refresh = (): void => {
    const compiled = service.activeScheme();
    matcher = compiled ? new Matcher(compiled) : null;
  };
  refresh();
  const unsub = service.active.subscribe(refresh);

  const onBeforeInput = (event: Event): void => {
    const m = matcher;
    if (!m || composing) return;
    const inputEvent = event as InputEvent;
    if (inputEvent.inputType !== 'insertText') {
      m.reset();
      return;
    }
    const data = inputEvent.data ?? '';
    if (!data) return;
    if (data.length !== 1) {
      // Multi-char insert — IME or autocomplete. Flush and pass through.
      const step = m.flushAndPassthrough(data);
      if (step.replaceTail > 0 || step.emit !== data) {
        event.preventDefault();
        replaceAtCaret(el, step.replaceTail, step.emit);
      }
      return;
    }
    const step = m.feed(data);
    if (step.replaceTail > 0 || step.emit !== data) {
      event.preventDefault();
      replaceAtCaret(el, step.replaceTail, step.emit);
    }
  };

  const onSelChange = (): void => {
    matcher?.reset();
  };

  const onCompositionStart = (): void => {
    composing = true;
    matcher?.reset();
  };
  const onCompositionEnd = (): void => {
    composing = false;
  };

  const onBlur = (): void => {
    matcher?.reset();
  };

  el.addEventListener('beforeinput', onBeforeInput);
  el.addEventListener('compositionstart', onCompositionStart);
  el.addEventListener('compositionend', onCompositionEnd);
  el.addEventListener('blur', onBlur);
  el.addEventListener('selectionchange', onSelChange as any);

  return () => {
    unsub();
    el.removeEventListener('beforeinput', onBeforeInput);
    el.removeEventListener('compositionstart', onCompositionStart);
    el.removeEventListener('compositionend', onCompositionEnd);
    el.removeEventListener('blur', onBlur);
    el.removeEventListener('selectionchange', onSelChange as any);
  };
};

const replaceAtCaret = (
  el: HTMLInputElement | HTMLTextAreaElement,
  replaceTail: number,
  emit: string,
): void => {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const head = el.value.slice(0, Math.max(0, start - replaceTail));
  const tail = el.value.slice(end);
  el.value = head + emit + tail;
  const caret = head.length + emit.length;
  try {
    el.setSelectionRange(caret, caret);
  } catch {}
  el.dispatchEvent(new Event('input', {bubbles: true}));
};
