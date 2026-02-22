import * as React from 'react';
import {IconsGridProvider} from './context';
import TwoColumnLayout from '../../../../../6-page/TwoColumnLayout';
import {IconsMenu} from './IconsMenu';
import {Page} from '../../../../../6-page/Page';
import {IconsRight} from './IconsRight';
import {NiceUiSizes} from '../../../../../constants';

export interface Props {
  steps: string[];
}

export const IconsPageLayout: React.FC<Props> = ({steps}) => {
  return (
    <Page>
      <IconsGridProvider>
        <TwoColumnLayout
          top={NiceUiSizes.TopNavHeight + 20}
          left={<IconsMenu steps={steps} />}
          right={<IconsRight steps={steps} />}
        />
      </IconsGridProvider>
    </Page>
  );
};
