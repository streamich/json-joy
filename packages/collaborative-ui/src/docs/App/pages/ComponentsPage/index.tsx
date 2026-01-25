import * as React from 'react';
import {DocsPages} from '@jsonjoy.com/ui/lib/6-page/DocsPages';
import {pageutils} from '@jsonjoy.com/ui/lib/6-page/DocsPages/util';
import {content} from '../../../content';
import {useNiceUiServices} from '@jsonjoy.com/ui/lib/context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {ConnectedSubNav} from '@jsonjoy.com/ui/lib/5-block/SubNav/ConnectedSubNav';
import {DocsFooter} from '../../components/DocsFooter';

const page = pageutils.find(content, ['components'])!;

export type Props = Record<string, never>;

export const ComponentsPage: React.FC<Props> = () => {
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
