import {md} from '../../markdown/parser';
import {concurrency} from 'thingies/lib/concurrency';
import type {ContentPage} from './types';

export interface MarkdownDownloadResult {
  text: string;
}

const appendPage = async (page: ContentPage, result: MarkdownDownloadResult, parents: string[]): Promise<void> => {
  if (!page.src) return;
  result.text += '---\n\n';
  result.text += `# ${parents.length ? parents.join(' > ') + ' > ' : ''}${page.name}\n\n`;
  result.text += await page.src();
  result.text += '\n\n';
  if (page.children && page.children.length) {
    for (const child of page.children) {
      await appendPage(child, result, [...parents, page.name]);
    }
  }
};

export const downloadPageAsMarkdown = async (page: ContentPage): Promise<MarkdownDownloadResult> => {
  const result: MarkdownDownloadResult = {
    text: '',
  };
  await appendPage(page, result, []);
  return result;
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
