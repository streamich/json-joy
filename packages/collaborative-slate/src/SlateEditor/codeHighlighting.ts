import * as React from 'react';
import {tokenize, type Token, type TokenNode} from 'code-colors';
import {BaseRange, Editor, Element as SlateElement, Node, Path} from 'slate';
import type {CodeBlockElement} from './types';

const PLAIN_TEXT_LANGUAGES = new Set(['', 'plain', 'plaintext', 'text', 'txt']);

export interface CodeSyntaxDecoration {
  codeTokenTypes?: string[];
}

interface FlatTokenSegment {
  length: number;
  types: string[];
}

type SyntaxRange = BaseRange & CodeSyntaxDecoration;

const EMPTY: SyntaxRange[] = [];

const normalizeLanguage = (language?: string): string | undefined => {
  const normalized = language?.trim().toLowerCase() ?? '';
  return PLAIN_TEXT_LANGUAGES.has(normalized) ? undefined : normalized;
};

const createCacheKey = (code: string, language: string): string => `${language}\u0000${code}`;

const sameTypes = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index++) if (a[index] !== b[index]) return false;
  return true;
};

const mergeTypes = (parent: string[], child: string[]): string[] => {
  if (!child.length) return parent;
  const next = [...parent];
  for (const type of child) {
    if (!type || type === 'plain' || type.startsWith('language-')) continue;
    if (!next.includes(type)) next.push(type);
  }
  return next;
};

const pushSegment = (segments: FlatTokenSegment[], length: number, types: string[]): void => {
  if (length <= 0) return;
  const last = segments[segments.length - 1];
  if (last && sameTypes(last.types, types)) {
    last.length += length;
    return;
  }
  segments.push({length, types: [...types]});
};

const flattenToken = (token: Token, inheritedTypes: string[], segments: FlatTokenSegment[]): void => {
  if (typeof token === 'number') {
    pushSegment(segments, token, inheritedTypes);
    return;
  }

  const [types, children] = token;
  const nextTypes = mergeTypes(inheritedTypes, types);
  for (const child of children) flattenToken(child, nextTypes, segments);
};

const flattenTokenTree = (tree: TokenNode): FlatTokenSegment[] => {
  const segments: FlatTokenSegment[] = [];
  const [, children] = tree;
  for (const child of children) flattenToken(child, [], segments);
  return segments;
};

const buildDecorationsForBlock = (
  texts: {path: Path; text: string}[],
  segments: FlatTokenSegment[],
): SyntaxRange[] => {
  const decorations: SyntaxRange[] = [];
  let textIndex = 0;
  let textOffset = 0;

  for (const segment of segments) {
    let remaining = segment.length;

    while (remaining > 0 && textIndex < texts.length) {
      const current = texts[textIndex];
      const available = current.text.length - textOffset;

      if (available <= 0) {
        textIndex++;
        textOffset = 0;
        continue;
      }

      const taken = Math.min(remaining, available);

      if (segment.types.length) {
        decorations.push({
          anchor: {path: current.path, offset: textOffset},
          focus: {path: current.path, offset: textOffset + taken},
          codeTokenTypes: segment.types,
        });
      }

      remaining -= taken;
      textOffset += taken;

      if (textOffset >= current.text.length) {
        textIndex++;
        textOffset = 0;
      }
    }
  }

  return decorations;
};

interface CacheEntry {
  codeKey: string;
  decorations: SyntaxRange[];
}

export const useCodeSyntaxDecorations = (_editor: Editor, _version: number) => {
  const cacheRef = React.useRef<Map<string, CacheEntry>>(new Map());

  return React.useCallback(
    (entry: [node: unknown, path: Path]): SyntaxRange[] => {
      const [node, path] = entry;
      if (!SlateElement.isElement(node) || (node as any).type !== 'code-block') return EMPTY;

      const block = node as CodeBlockElement;
      const language = normalizeLanguage(block.language);
      if (!language) return EMPTY;

      const texts: {path: Path; text: string}[] = [];
      for (const [textNode, relativePath] of Node.texts(block)) {
        texts.push({path: [...path, ...relativePath], text: textNode.text});
      }

      const code = texts.map((t) => t.text).join('');
      if (!code) return EMPTY;

      const codeKey = createCacheKey(code, language);
      const blockId = path.join('.');
      const cached = cacheRef.current.get(blockId);
      if (cached && cached.codeKey === codeKey) return cached.decorations;

      try {
        const tree = tokenize(code, language);
        const segments = flattenTokenTree(tree);
        const decorations = buildDecorationsForBlock(texts, segments);
        cacheRef.current.set(blockId, {codeKey, decorations});
        return decorations;
      } catch {
        return EMPTY;
      }
    },
    [],
  );
};