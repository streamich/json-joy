import * as React from 'react';
import {useT} from 'use-t';
import useTitle from 'react-use/lib/useTitle';
import {LibraryInfo} from './LibraryInfo';
import {Space} from '../../3-list-item/Space';
import type {ContentPage} from './types';
import {pageutils} from './util';
import {Markdown} from '../../markdown/Markdown';
import {NiceUiSizes} from '../../constants';
import DocsMarkdown from './DocsMarkdown';
import PageTitle from '../../5-block/PageTitle';
import {BasicButtonCopy} from '../../2-inline-block/BasicButton/BasicButtonCopy';

export interface Props {
  page: ContentPage;
}

const ContentPageMarkdown: React.FC<Props> = (props) => {
  const {page} = props;
  const [t] = useT();

  useTitle(pageutils.title(page));

  const copyAsMarkdown = async (): Promise<string> => {
    const body = page.src ? await page.src() : '';
    return `# ${pageutils.title(page)}\n\n${body}`;
  };

  return (
    <>
      <PageTitle
        key={page.to}
        right={<BasicButtonCopy onCopy={copyAsMarkdown} tooltip={t('Copy as Markdown')} rounder size={32} />}
      >
        {page.title ? <Markdown src={page.title} inline /> : pageutils.title(page)}
      </PageTitle>
      <LibraryInfo page={page} />
      <Space size={3} />
      {!!page.md && (
        <div style={{maxWidth: NiceUiSizes.BlogContentMaxWidth}}>
          <DocsMarkdown
            key={page.to}
            contents
            contentsRight
            contentWidth={NiceUiSizes.BlogContentMaxWidth + NiceUiSizes.SidebarWidth + 64}
            ast={page.md}
          />
        </div>
      )}
    </>
  );
};

export default ContentPageMarkdown;
