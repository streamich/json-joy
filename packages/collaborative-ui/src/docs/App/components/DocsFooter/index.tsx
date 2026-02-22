import * as React from 'react';
import {Link} from '@jsonjoy.com/ui/lib/1-inline/Link';
import {Footer} from '@jsonjoy.com/ui/lib/5-block/Footer/Footer';
import {FooterSection} from '@jsonjoy.com/ui/lib/5-block/Footer/FooterSection';

export type Props = Record<string, never>;

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
