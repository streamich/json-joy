import type {Flat} from 'mdast-flat/lib/types';
import type {MenuItem} from '../../4-card/StructuralMenu/types';
import React from 'react';

export type PageTypes = 'blog' | 'resource' | 'spec' | 'spec-note' | 'lib';

/**
 * Tree of site content pages.
 *
 * Extends {@link MenuItem}, so any `ContentPage` is also a valid menu item
 * and can be rendered directly by `<ContextMenu>`, `<ToolbarMenu>`, etc.
 */
export interface ContentPage extends MenuItem {
  /** Type of the page, whether it is blog post, resource, etc.. */
  type?: PageTypes;

  /** As displayed in main page title. */
  title?: string;
  /** As subtitle to the main page title. */
  subtitle?: React.ReactNode;
  smallSubtitle?: string;
  /** Up to a paragraph short description. */
  about?: string;
  /** Pointer to the parent page. */
  parent?: ContentPage;

  /** Main text content of the page in Markdown. */
  src?: () => Promise<string>;
  /** Main text content of the page parsed as Flat. */
  md?: () => Promise<Flat>;

  /** String full path of the page, like "/specs/json-rx/introduction". */
  to?: string;
  /** Last element of the page path, like "introduction". */
  slug?: string;
  /** Full page path as list of steps, like ["specs", "json-rx", "introduction"] */
  steps?: string[];

  logo?: React.FC<LogoProps>;

  /** ??? */
  showInMenu?: boolean;

  /** Whether contents table should be shown under the Markdown body of the page. */
  showContentsTable?: boolean;

  /** Used for specifications, for example, could say "working draft". */
  status?: string;

  /** Sorted list of children. */
  children?: ContentPage[];

  /** NPM package name. */
  pkg?: string;
  /**  GitHub repo name, if the page is a code library. */
  repo?: string;
  /** Path within the repo. */
  repoPath?: string;
}

/** @todo Is this needed? */
export interface LogoProps {
  size?: number;
  grey?: boolean;
  rounded?: boolean;
}
