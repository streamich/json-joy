import * as React from 'react';
import {useNiceUiServices} from '../../context';
import {useBehaviorSubject} from '../../hooks/useBehaviorSubject';
import {PageBreadcrumbs} from './PageBreadcrumbs';

export type ConnectedBreadcrumbsProps = {};

export const ConnectedBreadcrumbs: React.FC<ConnectedBreadcrumbsProps> = () => {
  const services = useNiceUiServices();
  const steps = useBehaviorSubject(services.nav.steps$);
  const page = services.content.root;

  return <PageBreadcrumbs page={page} steps={steps} />;
};
