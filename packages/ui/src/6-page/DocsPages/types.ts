import type {Flat} from 'mdast-flat/lib/types';

export type PageTypes = 'blog' | 'resource' | 'spec' | 'spec-note';

export interface ContentPage {
  /** Type of the page, whether it is blog post, resource, etc.. */
  type?: PageTypes;
  /** Unique identifier of the page. */
  id?: string;

  /** As displayed in navigation menu. */
  name: string;
  /** As displayed in main page title. */
  title?: string;
  /** As subtitle to the main page title. */
  subtitle?: string;
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

  /**  GitHub repo name, if the page is a code library. */
  repo?: string;
}

/** @todo Is this needed? */
export interface LogoProps {
  size?: number;
  grey?: boolean;
  rounded?: boolean;
}
