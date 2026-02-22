import * as React from 'react';
import DocsMenu from './DocsMenu';
import DocsRight from './DocsRight';
import DocsRightIndex from './DocsRightIndex';
import type {ContentPage} from './types';
import {pageutils} from './util';
import {Space} from '../../3-list-item/Space';
import TwoColumnLayout from '../TwoColumnLayout';
import {Page} from '../Page';
import {NiceUiSizes} from '../../constants';

const findPage = (page: ContentPage, steps: string[]): ContentPage | undefined => {
  if (!steps.length) return page;
  const [step, ...rest] = steps;
  const child = page.children?.find((p) => p.slug === step);
  if (!child) return;
  return findPage(child, rest);
};

export interface Props {
  steps: string[];
  page: ContentPage;
  top?: number;
}

export const DocsPages: React.FC<Props> = (props) => {
  const {steps, page, top = NiceUiSizes.TopNavHeight + NiceUiSizes.TopNavHeight - 12} = props;
  const [, ...otherSteps] = steps;

  // Preload in the background all children of the current page.
  React.useEffect(() => {
    pageutils.preloadChildren(page);
  }, [page.to, page]);

  let right = null;
  if (!steps.length) right = <DocsRightIndex page={page} />;
  else {
    const innerPage = findPage(page, otherSteps);
    if (innerPage) right = <DocsRight top={page} page={innerPage} />;
  }

  return (
    <Page>
      <Space size={3} />
      <TwoColumnLayout sidebarTopPadding={32} left={<DocsMenu steps={steps} page={page} />} top={top} right={right} />
    </Page>
  );
};
