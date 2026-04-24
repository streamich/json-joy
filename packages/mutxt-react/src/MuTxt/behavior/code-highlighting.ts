import {tokenize, tokenizeAsync, type Token, type TokenNode} from 'code-colors';
import {BaseRange, Element as SlateElement, Node, Path} from 'slate';
import {rsync} from '@jsonjoy.com/ui';
import {CodeBlockElement} from '../types';

const PLAIN_TEXT_LANGUAGES = new Set(['', 'plain', 'plaintext', 'text', 'txt']);

/** Grammars that must be loaded before the keyed grammar can be loaded. */
const LANGUAGE_DEPS: Record<string, string[]> = {
  cpp: ['c'],
  'c++': ['c'],
  cilkc: ['c'],
  cilkcpp: ['c', 'cpp'],
  objectivec: ['c'],
  arduino: ['c', 'cpp'],
  scss: ['css'],
  less: ['css'],
  sass: ['css'],
  'css-extras': ['css'],
  jsx: ['javascript'],
  tsx: ['javascript', 'jsx', 'typescript'],
  'js-extras': ['javascript'],
  'js-templates': ['javascript'],
  jsdoc: ['javascript'],
  javadoc: ['java'],
  phpdoc: ['php'],
  vbnet: ['basic'],
  'visual-basic': ['basic'],
  aspnet: ['markup', 'csharp'],
  cshtml: ['markup', 'css', 'javascript', 'csharp'],
  django: ['markup', 'python'],
  ejs: ['javascript', 'markup'],
  erb: ['markup', 'ruby'],
  etlua: ['lua', 'markup'],
  ftl: ['markup'],
  handlebars: ['markup'],
  haml: ['ruby'],
  latte: ['markup', 'php'],
  liquid: ['markup'],
  pug: ['javascript', 'css', 'markup'],
  smarty: ['markup', 'php'],
  twig: ['markup'],
  tt2: ['markup', 'perl'],
  xeora: ['markup'],
  'php-extras': ['php'],
  'xml-doc': ['markup'],
};

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
  if (language === 'jsonc') return 'json';
  if (language === 'typescript') return 'ts';
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

export class CodeHighlightState {
  public readonly tick = rsync.val(0);

  private readonly cache = new Map<string, CacheEntry>();
  private readonly loadedLangs = new Set<string>();
  private readonly pendingLangs = new Set<string>();
  private readonly failedLangs = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.onGlobalError);
    }
  }

  private readonly onGlobalError = (event: ErrorEvent): void => {
    const filename = event.filename ?? '';
    if (!filename.includes('prismjs') && !filename.includes('prism-')) return;
    const match = filename.match(/prism-([a-z0-9+#-]+)\.min\.js/);
    if (match) {
      const lang = match[1];
      this.pendingLangs.delete(lang);
      this.failedLangs.add(lang);
      event.preventDefault();
      this.tick.next(this.tick.value + 1);
    }
  };

  private async loadLanguage(language: string): Promise<void> {
    const deps = LANGUAGE_DEPS[language] ?? [];
    for (const dep of deps) {
      if (!this.loadedLangs.has(dep) && !this.failedLangs.has(dep)) {
        await tokenizeAsync('', dep);
        this.loadedLangs.add(dep);
      }
    }
    await tokenizeAsync('', language);
  }

  public decorate(entry: [node: unknown, path: Path]): SyntaxRange[] {
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
    const cached = this.cache.get(blockId);
    if (cached && cached.codeKey === codeKey) return cached.decorations;

    try {
      const tree = tokenize(code, language);
      if (tree[0][0] !== 'language-' + language) throw new Error('grammar-not-loaded');
      const segments = flattenTokenTree(tree);
      const decorations = buildDecorationsForBlock(texts, segments);
      this.cache.set(blockId, {codeKey, decorations});
      return decorations;
    } catch {
      if (!this.loadedLangs.has(language) && !this.pendingLangs.has(language) && !this.failedLangs.has(language)) {
        this.pendingLangs.add(language);
        this.loadLanguage(language)
          .then(() => {
            this.pendingLangs.delete(language);
            this.loadedLangs.add(language);
            this.cache.clear();
            this.tick.next(this.tick.value + 1);
          })
          .catch(() => {
            this.pendingLangs.delete(language);
            this.failedLangs.add(language);
          });
      }
      return EMPTY;
    }
  }

  public readonly dispose = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.onGlobalError);
    }
  };
}