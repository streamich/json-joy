import * as React from 'react';
import {useTheme} from 'nano-theme';
import Paper from '../../4-card/Paper';
import {Link} from '../../1-inline/Link';
import {FixedColumn} from '../../3-list-item/FixedColumn';
import {Iconista} from '../../icons/Iconista';
import {Code} from '../../1-inline/Code';
import {useT} from 'use-t';
import type {ContentPage} from './types';

export interface Props {
  page: ContentPage;
}

export const LibraryInfo: React.FC<Props> = (props) => {
  const [t] = useT();
  const theme = useTheme();
  const {page} = props;

  if (!page.repo) return null;

  return (
    <Paper fill={1}>
      <p style={{padding: '0 16px'}}>
        <Link a to={`https://github.com/${page.repo}`}>
          <FixedColumn as={'span'} left={36} style={{alignItems: 'center'}}>
            <span>
              <Iconista set="fontawesome_brands" icon="github" width={24} height={24} />
            </span>
            <span style={{fontSize: '16px', color: theme.g(0.1)}}>
              {t('View')}{' '}
              <Code alt gray spacious>
                {page.repo}
              </Code>{' '}
              {t('library on GitHub')}
            </span>
          </FixedColumn>
        </Link>
      </p>
    </Paper>
  );
};
