import * as React from 'react';
import {DocsPages} from 'nice-ui/lib/6-page/DocsPages';
import {pageutils} from 'nice-ui/lib/6-page/DocsPages/util';
import {content} from '../../../content';
import {useNiceUiServices} from 'nice-ui/lib/context';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {ConnectedSubNav} from 'nice-ui/lib/5-block/SubNav/ConnectedSubNav';
import {DocsFooter} from '../../components/DocsFooter';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = Record<string, never>;

export const GuidelinesPage: React.FC<Props> = () => {
  const services = useNiceUiServices();
  const steps = useBehaviorSubject(services.nav.steps$);

  if (!page) return null;

  return (
    <>
      <ConnectedSubNav />
      <DocsPages page={page} steps={steps} />
      <DocsFooter />
    </>
  );
};
