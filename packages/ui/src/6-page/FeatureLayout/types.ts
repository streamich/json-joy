import type {Icon} from 'iconista/lib/types';
import type {ContentPage} from '../DocsPages/types';

/** A call to action: label plus an internal route or absolute URL. */
export interface Cta {
  label: string;
  to: string;
}

/** A headline statistic, like "3.8%" with a supporting line. */
export interface FeatureStat {
  /** Large value, e.g. "3.8%" or "100x". */
  value: string;
  /** Small qualifier shown beside the value, e.g. "faster". */
  unit?: string;
  /** Supporting line under the value. */
  label: string;
}

/** An icon-plus-paragraph value proposition. */
export interface FeatureValueProp {
  /** Optional small icon, same spec as library tech icons. */
  icon?: Icon;
  /** Optional short title above the body. */
  title?: string;
  /** One-paragraph value statement. */
  body: string;
}

/** A "more to discover" cross-link to a related feature or page. */
export interface FeatureLink {
  title: string;
  body?: string;
  to: string;
  /** Optional thumbnail or illustration. */
  visual?: () => React.ReactNode;
}

/**
 * A major product feature (JSON CRDT, plain text, rich text). Extends
 * {@link ContentPage} with the marketing identity reused across surfaces:
 * the page hero, feature modals, cards, popovers, and search.
 */
export interface ContentFeature extends ContentPage {
  /** Short label above the headline, e.g. "JSON CRDT". Distinct from `name`. */
  eyebrow?: string;
  /** Primary brand color as a solid CSS color. Derived by hashing the feature id or name when omitted. */
  color?: string;
  /** Checklist bullets shown in the modal and hero. */
  highlights?: string[];
  /** Primary call to action. */
  primaryCta?: Cta;
  /** Secondary call to action. */
  secondaryCta?: Cta;
  /** Large showcase illustration, shown on the left of the showcase row. */
  visual?: () => React.ReactNode;
  /** Small secondary illustration, shown beside the stats in the showcase column. */
  visualSmall?: () => React.ReactNode;
  /** Headline statistic callouts. */
  stats?: FeatureStat[];
  /** Icon-plus-paragraph value props. */
  valueProps?: FeatureValueProp[];
  /** "More to discover" cross-links to related features. */
  related?: FeatureLink[];
}
