import type {Icon} from 'iconista/lib/types';
import type {ContentPage} from '../6-page/DocsPages/types';

export type {ContentPage, PageTypes} from '../6-page/DocsPages/types';

export type IconSpec = Icon;

/** Landing-page category a library belongs to. */
export type LibGroupId = 'tooling' | 'plain-text' | 'rich-text' | 'ui' | 'sync';

/**
 * A code library documentation page. Lives here (not in the site package) so
 * that each library can self-describe its docs from `packages/<lib>/docs/`
 * without depending on the site. The site may still augment these fields.
 */
export interface LibPage extends ContentPage {
  /** Published npm package name, e.g. "@jsonjoy.com/json-pack". */
  pkg?: string;
  /** Primary language or runtime, e.g. "TypeScript", "Node.js", "Web". */
  tech?: string;
  /** Icon shown next to `tech` in the card. */
  techIcon?: IconSpec;
  /** Library technical identifier. */
  libId?: string;
  /** Landing-page category. Defaults to `tooling`. */
  group?: LibGroupId;
  /** Highlight this lib as a card at the top of the landing (in addition to its group). */
  featured?: boolean;
}
