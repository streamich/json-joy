import {md} from '../../markdown/parser';
import {concurrency} from 'thingies/lib/concurrency';
import type {ContentPage} from './types';
import type {LibPage} from '../../types/libs';

export interface MarkdownDownloadResult {
  text: string;
}

const SITE_ORIGIN = 'https://jsonjoy.com';

const absolutize = (markdown: string): string => markdown.replace(/\]\(\/(?!\/)/g, `](${SITE_ORIGIN}/`);

/** Preamble for a documentation download: title, what the file is, and resource links. */
const buildHeader = (page: ContentPage, words: number): string => {
  const {pkg} = page as LibPage;
  const title = page.title || page.name || page.slug || 'Documentation';
  const docsUrl = page.to ? `${SITE_ORIGIN}${page.to}` : SITE_ORIGIN;
  const repoUrl = page.repo ? `https://github.com/${page.repo}${page.repoPath ? `/${page.repoPath}` : ''}` : undefined;

  let header = `# ${title}\n\n`;
  if (page.subtitle) header += `> ${page.subtitle}\n\n`;
  header +=
    `This file is the complete documentation for **${title}**, part of [json-joy](${SITE_ORIGIN}), a suite ` +
    `of high-performance TypeScript libraries for JSON, JSON CRDT, and real-time collaborative editing. It ` +
    `is bundled as a single Markdown document for use as LLM context or offline reading; the live version ` +
    `is at ${docsUrl}.\n\n`;
  if (page.about) header += `${page.about}\n\n`;

  const rows: [string, string][] = [['Documentation', docsUrl]];
  if (pkg) rows.push(['NPM', `https://www.npmjs.com/package/${pkg}`]);
  if (repoUrl) rows.push(['GitHub', repoUrl]);
  if (pkg) rows.push(['Install', `\`npm install ${pkg}\``]);
  header += '| Resource | Link |\n| --- | --- |\n';
  for (const [name, link] of rows) header += `| ${name} | ${link} |\n`;
  header += '\n';

  const date = new Date().toISOString().slice(0, 10);
  header += `_Generated ${date} from ${docsUrl} (~${words.toLocaleString('en-US')} words)._\n\n`;
  return header;
};

/** Nested list of all sub-pages, so the reader sees the full scope up front. */
const buildToc = (page: ContentPage): string => {
  if (!page.children || !page.children.length) return '';
  let toc = '## Contents\n\n';
  const walk = (pages: ContentPage[], depth: number): void => {
    for (const p of pages) {
      const title = p.title || p.name || p.slug || '';
      const url = p.to ? `${SITE_ORIGIN}${p.to}` : undefined;
      toc += `${'  '.repeat(depth)}- ${url ? `[${title}](${url})` : title}\n`;
      if (p.children && p.children.length) walk(p.children, depth + 1);
    }
  };
  walk(page.children, 0);
  return toc + '\n';
};

const appendPage = async (page: ContentPage, result: MarkdownDownloadResult, parents: string[]): Promise<void> => {
  if (!page.src) return;
  result.text += '---\n\n';
  result.text += `# ${parents.length ? parents.join(' > ') + ' > ' : ''}${page.name}\n\n`;
  result.text += absolutize(await page.src());
  result.text += '\n\n';
  if (page.children && page.children.length) {
    for (const child of page.children) {
      await appendPage(child, result, [...parents, page.name]);
    }
  }
};

export const downloadPageAsMarkdown = async (page: ContentPage): Promise<MarkdownDownloadResult> => {
  // Build the body first so the header can report its size. The header supplies
  // the document's H1, so the root page's body follows it directly; child pages
  // keep their `parent > name` section headings.
  const body: MarkdownDownloadResult = {text: ''};
  if (page.src) {
    body.text += '---\n\n';
    body.text += absolutize(await page.src());
    body.text += '\n\n';
  }
  if (page.children && page.children.length) {
    for (const child of page.children) {
      await appendPage(child, body, [page.name]);
    }
  }
  const words = body.text.trim() ? body.text.trim().split(/\s+/).length : 0;
  return {text: buildHeader(page, words) + buildToc(page) + body.text};
};

export const downloadFile = (filename: string, text: string, mime = 'text/plain'): void => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${mime};charset=utf-8,` + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const openInNewTab = (title: string, text: string): void => {
  const w = window.open('');
  if (!w) return;
  w.document.write(`<pre>${text}</pre>`);
  w.document.title = title;
};

export const augmentContentPages = (page: ContentPage, parent?: ContentPage) => {
  page.parent = parent;
  if (typeof page.slug !== 'string' && page.name) page.slug = page.name.toLowerCase().replace(/\s+/g, '-');
  if (!page.steps) page.steps = page.slug ? [...(parent?.steps ?? []), page.slug!] : [];
  page.to = '/' + page.steps!.join('/');
  if (page.children) {
    const length = page.children.length;
    for (let i = 0; i < length; i++) {
      const child = page.children[i];
      augmentContentPages(child, page);
    }
  }
  if (page.src && !page.md) {
    page.md = async () => {
      if (!(page as any)._md) (page as any)._md = page.src!().then((src) => md(src));
      return await (page as any)._md;
    };
  }
};

const preloadLimiter = concurrency(3);

const preload = (exec: () => Promise<unknown>): void => {
  preloadLimiter(exec).catch((error: unknown) => {
    console.log('Preload error'); // eslint-disable-line no-console
    console.error(error); // eslint-disable-line no-console
  });
};

export const pageutils = {
  title: (page: ContentPage): string => {
    return page.title || page.name || page.slug!;
  },

  prevSibling: (page: ContentPage): ContentPage | undefined => {
    if (!page.parent) return undefined;
    const siblings = page.parent.children;
    if (!siblings) return;
    const index = siblings.indexOf(page);
    return index === -1 ? undefined : siblings[index - 1];
  },

  nextSibling: (page: ContentPage): ContentPage | undefined => {
    const parent = page.parent;
    if (!parent) return undefined;
    const siblings = parent.children;
    if (!siblings) return;
    const index = siblings.indexOf(page);
    return index === -1 ? undefined : siblings[index + 1];
  },

  prev: (page: ContentPage): ContentPage | undefined => {
    const prev = pageutils.prevSibling(page);
    if (prev && prev.children && prev.children.length) {
      let lastChild = prev.children[prev.children.length - 1];
      while (lastChild.children && lastChild.children.length) {
        lastChild = lastChild.children[lastChild.children.length - 1];
      }
      return lastChild;
    }
    if (prev) return prev;
    return page.parent;
  },

  next: (page: ContentPage, noParentCrawl?: boolean): ContentPage | undefined => {
    const children = page.children;
    if (children && children.length) return children[0];
    const sibling = pageutils.nextSibling(page);
    if (sibling) return sibling;
    if (!noParentCrawl) {
      while (page.parent) {
        const parent = page.parent;
        const nextSibling = pageutils.nextSibling(parent);
        if (nextSibling) return nextSibling;
        page = parent;
      }
    }
    return;
  },

  /** @todo This could internally use `.walk()` implementation. */
  find: (page: ContentPage, to: string | string[]): ContentPage | undefined => {
    if (typeof to === 'string') to = to.slice(1).split('/');
    let index = 0;
    let curr: undefined | ContentPage = page;
    while (curr) {
      if (index >= to.length) return curr;
      const slug = to[index++];
      const children: typeof curr.children = curr.children;
      if (!children) return undefined;
      curr = children.find((child) => child.slug === slug);
    }
    return;
  },

  preloadChildren: async (page: ContentPage) => {
    if (!page.children) return;
    for (let i = 0; i < page.children.length; i++) {
      const child = page.children[i];
      if (child && child.md) preload(() => child.md!());
      pageutils.preloadChildren(child);
    }
  },

  walk(page: ContentPage, steps: string[], index = 0): ContentPage[] {
    const list: ContentPage[] = [];
    let curr: ContentPage | undefined = page;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const children: ContentPage[] | undefined = curr.children;
      if (!children) break;
      curr = children.find((c) => c.slug === steps[index]);
      index++;
      if (!curr) break;
      list.push(curr);
    }
    return list;
  },
};
