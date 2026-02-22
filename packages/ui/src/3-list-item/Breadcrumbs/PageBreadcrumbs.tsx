import * as React from 'react';
import type {ContentPage} from '../../6-page/DocsPages/types';
import {Breadcrumb} from './Breadcrumb';
import {Breadcrumbs} from './Breadcrumbs';
import {pageutils} from '../../6-page/DocsPages/util';

export type Page = Pick<ContentPage, 'name' | 'title' | 'id' | 'slug' | 'to' | 'children'>;

export interface PageBreadcrumbsProps {
  page: Page;
  steps: string[];
}

export const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({page, steps}) => {
  const crumbs: React.ReactNode[] = [];
  const pages = pageutils.walk(page, steps);
  const length = pages.length;
  const last = length - 1;
  for (let i = 0; i <= last; i++) {
    const curr = pages[i];
    crumbs.push(
      <Breadcrumb key={curr.to + ''} to={curr.to || '/'} noHover={i === last}>
        {curr.name || curr.title || curr.id || ''}
      </Breadcrumb>,
    );
  }

  return <Breadcrumbs crumbs={crumbs} />;
};
