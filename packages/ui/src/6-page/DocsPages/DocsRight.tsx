import * as React from 'react';
import PrevNext from './PrevNext';
import ContentPageMarkdown from './ContentPageMarkdown';
import ContentsList from './ContentsList';
import type {ContentPage} from './types';
import {Space} from '../../3-list-item/Space';

export interface Props {
  top?: ContentPage;
  page: ContentPage;
}

const DocsRight: React.FC<Props> = (props) => {
  const {top, page} = props;

  return (
    <>
      <ContentPageMarkdown page={page} />
      {!!page.showContentsTable && <ContentsList page={page} />}
      <Space size={8} />
      <PrevNext top={top} page={page} />
    </>
  );
};

export default DocsRight;
