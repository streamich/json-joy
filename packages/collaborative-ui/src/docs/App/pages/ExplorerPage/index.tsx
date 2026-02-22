import * as React from 'react';
import {pageutils} from '@jsonjoy.com/ui/lib/6-page/DocsPages/util';
import {content} from '../../../content';
import {ConnectedSubNav} from '@jsonjoy.com/ui/lib/5-block/SubNav/ConnectedSubNav';
import {DocsFooter} from '../../components/DocsFooter';
import {JsonCrdtExplorer} from '../../../../JsonCrdtExplorer';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Page} from '@jsonjoy.com/ui/lib/6-page/Page';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = Record<string, never>;

export const ExplorerPage: React.FC<Props> = () => {
  if (!page) return null;

  return (
    <>
      <ConnectedSubNav />
      <Page hackFooterLocation>
        <Space size={3} />
        <JsonCrdtExplorer />
      </Page>
      <DocsFooter />
    </>
  );
};
