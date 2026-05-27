import * as React from 'react';
import {useT} from 'use-t';
import ContentsList from './ContentsList';
import ContentPageMarkdown from './ContentPageMarkdown';
import PrevNext from './PrevNext';
import {downloadFile, downloadPageAsMarkdown} from './util';
import type {ContentPage} from './types';
import {Space} from '../../3-list-item/Space';
import DownloadIcon__svg from 'iconista/lib/react/auth0/download';
import BasicButton from '../../2-inline-block/BasicButton';
import {BasicButtonCopy} from '../../2-inline-block/BasicButton/BasicButtonCopy';

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

  const onCopyClick = async () => {
    const md = await downloadPageAsMarkdown(page);
    return md.text;
  };

  return (
    <>
      <ContentPageMarkdown page={page} />
      {!!showSpecDownloadButton && (
        <>
          <Space size={3} />
          <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
            <BasicButton bdradR={3} rounder border height={32} width={'auto'} onClick={onSpecDownloadClick}>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <DownloadIcon__svg width={16} height={16} />
                {t('Download as Markdown')}
              </span>
            </BasicButton>
            <BasicButtonCopy bdradL={3} rounder border size={32} onCopy={onCopyClick} />
          </div>
        </>
      )}
      {page.children && page.children.length ? <ContentsList page={page} /> : null}
      <Space size={8} />
      <PrevNext top={page} page={page} onlyNext />
    </>
  );
};

export default DocsRightIndex;
