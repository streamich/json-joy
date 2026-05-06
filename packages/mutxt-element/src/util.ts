import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {FORMATS, HOST_STYLE_ID} from './constants';
import type {SlateEditorDocument} from 'mutxt-react';
import type {ObjApi, ObjNode} from 'json-joy/lib/json-crdt';
import type {MuTxtFormat, SeedProps} from './types';

/** Inject the host stylesheet exactly once per document. */
export const ensureHostStyle = (): void => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOST_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = 'mu-txt{display:block;box-sizing:border-box;width:100%;height:100%;min-height:320px;}';
  document.head.appendChild(style);
};

/**
 * Strip the common leading whitespace shared by every non-empty line. Lets
 * authors indent inline content along with surrounding HTML without the
 * indent leaking into the parsed source.
 */
const dedent = (raw: string): string => {
  const trimmed = raw.replace(/^[ \t]*\r?\n|\r?\n[ \t]*$/g, '');
  const lines = trimmed.split(/\r?\n/);
  let min = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(/^[ \t]*/);
    if (m) min = Math.min(min, m[0].length);
  }
  if (!Number.isFinite(min) || min === 0) return lines.join('\n');
  return lines.map((l) => l.slice(min)).join('\n');
};

const textToSlate = (text: string): SlateEditorDocument =>
  text.split(/\r?\n/).map((line) => ({type: 'p', children: [{text: line}]})) as SlateEditorDocument;

const parseSlateJson = (text: string): SlateEditorDocument | undefined => {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as SlateEditorDocument;
  } catch {}
  return undefined;
};

// TODO: replace with a real markdown
const markdownToSlate = (text: string): SlateEditorDocument => textToSlate(text);

const isFormat = (v: string | null): v is MuTxtFormat =>
  v !== null && (FORMATS as readonly string[]).includes(v);

/** Decide which seed format to use based on attributes and presence of inputs. */
export const resolveFormat = (
  formatAttr: string | null,
  srcAttr: string | null,
  hasChildren: boolean,
  hasFromSlateProp: boolean,
): MuTxtFormat | null => {
  if (isFormat(formatAttr)) return formatAttr;
  if (srcAttr) return 'native';
  if (hasFromSlateProp) return 'slate';
  if (hasChildren) return 'text';
  return null;
};

const seedFromText = (format: MuTxtFormat, text: string): SeedProps => {
  switch (format) {
    case 'slate': {
      const doc = parseSlateJson(text);
      return doc ? {fromSlate: doc} : {};
    }
    case 'markdown':
      return {fromSlate: markdownToSlate(text)};
    case 'text':
      return {fromSlate: textToSlate(text)};
    case 'native':
      // `native` is binary; no meaningful interpretation of text source.
      return {};
  }
};

/** Synchronous seed resolution from the element's children + JS property. */
export const seedFromChildren = (
  format: MuTxtFormat | null,
  raw: string,
  fromSlateProp?: SlateEditorDocument,
): SeedProps => {
  if (!format) return fromSlateProp ? {fromSlate: fromSlateProp} : {};
  if (format === 'native') return {}; // native requires `src`
  if (format === 'slate' && fromSlateProp) return {fromSlate: fromSlateProp};
  return seedFromText(format, dedent(raw));
};

/** Async seed resolution from a URL or data URL via `fetch()`. */
export const loadFromSrc = async (
  src: string,
  format: MuTxtFormat,
  signal?: AbortSignal,
): Promise<SeedProps> => {
  const response = await fetch(src, {signal});
  if (format === 'native') {
    const buffer = await response.arrayBuffer();
    const model = ModelWithExt.load(new Uint8Array(buffer));
    return {obj: model.api.obj([]) as ObjApi<ObjNode>};
  }
  const text = await response.text();
  return seedFromText(format, text);
};
