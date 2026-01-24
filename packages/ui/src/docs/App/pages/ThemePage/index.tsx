import * as React from 'react';
import {pageutils} from '../../../../6-page/DocsPages/util';
import {content} from '../../../content';
import {useNiceUiServices} from '../../../../context';
import {DocsFooter} from '../../components/DocsFooter';
import {Space} from '../../../../3-list-item/Space';
import {Page} from '../../../../6-page/Page';
import {ThemeColors} from './ThemeColors';
import {useStyles} from '../../../../styles/context';

const page = pageutils.find(content, ['guidelines'])!;

export type Props = {};

export const ThemePage: React.FC<Props> = () => {
  const _services = useNiceUiServices();
  const styles = useStyles();

  if (!page) return null;

  return (
    <>
      <Space size={2} />
      <Page>
        <ThemeColors theme={styles.theme} />
      </Page>
      <DocsFooter />
    </>
  );
};
