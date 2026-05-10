import {CompiledScheme, Matcher} from './Matcher';
import type {TranslitScheme} from './types';

/**
 * One-shot convert a string from Latin to the target script.
 *
 * Useful for tests, batch transforms, search-input prefill, etc. For
 * keystroke-by-keystroke editing use `Matcher` directly.
 */
export const convert = (input: string, scheme: TranslitScheme | CompiledScheme): string => {
  const compiled = scheme instanceof CompiledScheme ? scheme : new CompiledScheme(scheme);
  const matcher = new Matcher(compiled);
  let out = '';
  for (const ch of input) {
    const step = matcher.feed(ch);
    if (step.replaceTail > 0) out = out.slice(0, out.length - step.replaceTail);
    out += step.emit;
  }
  const flushed = matcher.flushBuffer();
  if (flushed.replaceTail > 0) out = out.slice(0, out.length - flushed.replaceTail);
  out += flushed.emit;
  // Apply final-form to the last glyph.
  const finalForm = compiled.applyFinalForm(out);
  if (finalForm) out = out.slice(0, out.length - finalForm.tail) + finalForm.replacement;
  return out;
};
