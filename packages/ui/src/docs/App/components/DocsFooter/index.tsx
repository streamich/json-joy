import * as React from 'react';
import {Link} from '../../../../1-inline/Link';
import {Footer} from '../../../../5-block/Footer/Footer';
import {FooterSection} from '../../../../5-block/Footer/FooterSection';

export type Props = {};

export const DocsFooter: React.FC<Props> = () => {
  return (
    <Footer>
      <FooterSection title={'Documentation'}>
        <Link a to={'/guidelines'}>
          Guidelines
        </Link>
        <Link a to={'/components'}>
          Components
        </Link>
      </FooterSection>
    </Footer>
  );
};
