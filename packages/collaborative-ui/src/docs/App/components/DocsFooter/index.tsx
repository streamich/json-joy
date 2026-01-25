import * as React from 'react';
import {Link} from 'nice-ui/lib/1-inline/Link';
import {Footer} from 'nice-ui/lib/5-block/Footer/Footer';
import {FooterSection} from 'nice-ui/lib/5-block/Footer/FooterSection';

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
