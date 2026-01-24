import * as React from 'react';
import {rule} from 'nano-theme';
import {Link} from 'react-router-lite';
import type {ContentPage} from '../types';
import {Markdown} from '../../../markdown/Markdown';
import {pageutils} from '../util';

const listClass = rule({
  pad: 0,
  mar: 0,
  listStyle: 'none',
  fz: '0.97em',
});

const listItemClass = rule({
  pad: 0,
  mar: 0,
  p: {
    pad: '0.38em 0',
    mar: 0,
  },
});

const itemBulletClass = rule({
  op: 0.5,
});

export interface PageListProps {
  seq?: string;
  pages: ContentPage[];
}

export const PageList: React.FC<PageListProps> = ({seq, pages}) => {
  return (
    <ol className={listClass}>
      {pages.map((page, i) => (
        <PageListItem key={page.to!} seq={`${seq ? seq + '.' : ''}${i.toString(16)}`} page={page} />
      ))}
    </ol>
  );
};

export interface PageListItemProps {
  seq: string;
  page: ContentPage;
}

export const PageListItem: React.FC<PageListItemProps> = ({seq, page}) => {
  const to = page.to!;

  const title = page.title ? <Markdown src={page.title} inline /> : pageutils.title(page);

  let children: React.ReactNode = null;
  if (page.children && page.children.length) {
    children = <PageList seq={seq} pages={page.children} />;
  }

  return (
    <li className={listItemClass}>
      <p>
        <span className={itemBulletClass}>{seq}</span>
        &nbsp;&nbsp;
        <Link a to={to}>
          {title}
        </Link>
      </p>
      <div style={{paddingLeft: '1.5em'}}>{children}</div>
    </li>
  );
};
