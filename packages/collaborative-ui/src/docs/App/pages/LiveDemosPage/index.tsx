import * as React from 'react';
import {pageutils} from 'nice-ui/lib/6-page/DocsPages/util';
import {content} from '../../../content';
import {ConnectedSubNav} from 'nice-ui/lib/5-block/SubNav/ConnectedSubNav';
import {DocsFooter} from '../../components/DocsFooter';
import {JsonCrdtDemos} from '../../../../JsonCrdtDemos';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {Page} from 'nice-ui/lib/6-page/Page';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = Record<string, never>;

export const LiveDemosPage: React.FC<Props> = () => {
  if (!page) return null;

  return (
    <>
      <ConnectedSubNav />
      <Page hackFooterLocation>
        <Space size={3} />
        <JsonCrdtDemos basePath={['demos']} />
      </Page>
      <DocsFooter />
    </>
  );
};
