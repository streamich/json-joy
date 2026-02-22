import * as React from 'react';
import {DocsPages} from '../../../../6-page/DocsPages';
import {pageutils} from '../../../../6-page/DocsPages/util';
import {content} from '../../../content';
import {useNiceUiServices} from '../../../../context';
import {useBehaviorSubject} from '../../../../hooks/useBehaviorSubject';
import {ConnectedSubNav} from '../../../../5-block/SubNav/ConnectedSubNav';
import {DocsFooter} from '../../components/DocsFooter';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = {};

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
