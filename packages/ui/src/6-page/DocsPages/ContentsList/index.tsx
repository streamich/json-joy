import * as React from 'react';
import {useT} from 'use-t';
import {PageList} from '../PageList';
import type {ContentPage} from '../types';
import {Space} from '../../../3-list-item/Space';
import {MiniTitle} from '../../../3-list-item/MiniTitle';

export interface Props {
  page: ContentPage;
}

const ContentsList: React.FC<Props> = ({page}) => {
  const [t] = useT();

  return (
    <>
      <Space size={4} />
      <MiniTitle>{t('Contents')}</MiniTitle>
      <Space size={-1} />
      {page.children ? <PageList pages={page.children} /> : null}
    </>
  );
};

export default ContentsList;
