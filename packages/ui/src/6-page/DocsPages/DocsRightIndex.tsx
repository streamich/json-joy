import * as React from 'react';
import {useT} from 'use-t';
import ContentsList from './ContentsList';
import ContentPageMarkdown from './ContentPageMarkdown';
import PrevNext from './PrevNext';
import {downloadFile, downloadPageAsMarkdown} from './util';
import type {ContentPage} from './types';
import {Space} from '../../3-list-item/Space';
import {Button} from '../../2-inline-block/Button';

export interface Props {
  page: ContentPage;
}

const DocsRightIndex: React.FC<Props> = (props) => {
  const {page} = props;
  const [t] = useT();

  const showSpecDownloadButton = page.type === 'spec' || page.type === 'spec-note';

  const onSpecDownloadClick = async () => {
    const md = await downloadPageAsMarkdown(page);
    downloadFile(`${page.slug}.md`, md.text, 'text/markdown');
  };

  return (
    <>
      <ContentPageMarkdown page={page} />
      {!!showSpecDownloadButton && (
        <>
          <Space size={3} />
          <Button ghost={true} size={-1} onClick={onSpecDownloadClick}>
            {t('Download as Markdown')}
          </Button>
        </>
      )}
      {page.children && page.children.length ? <ContentsList page={page} /> : null}
      <Space size={8} />
      <PrevNext top={page} page={page} onlyNext />
    </>
  );
};

export default DocsRightIndex;
