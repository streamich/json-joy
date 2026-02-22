import type {MenuItem} from '../../StructuralMenu/types';

export interface SearchMatch {
  path: MenuItem[];
  item: MenuItem;
}

// export interface SearchResult {
//   /** The search query. */
//   query: string;

//   /** All search matches. */
//   all: SearchMatch[];

//   /** Exact matches (which don't have children) at the root (first level) of menu. */
//   leaf: SearchMatch[];

//   /** Exact matches (which don't have children) nested in the menu. */
//   exactNested: SearchMatch[];

//   /** Matches which have children. */
//   nested: SearchMatch[];
// }
