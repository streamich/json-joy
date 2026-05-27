import * as React from 'react';
import {DisplayTitle, type DisplayTitleProps} from '../DisplayTitle';

export type SectionTitleProps = DisplayTitleProps;

/**
 * Heading shown above a content block, e.g. "More to discover" or "What teams
 * build". A thin wrapper over {@link DisplayTitle} that defaults to the lighter
 * title weight. Any {@link DisplayTitleProps} override the defaults.
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({lite = true, ...props}) => (
  <DisplayTitle lite={lite} {...props} />
);

export default SectionTitle;
