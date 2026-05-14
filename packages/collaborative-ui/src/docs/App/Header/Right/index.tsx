import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextItem, ContextPane, ContextSep} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {ThemeContextItem} from './ThemeContextItem';
import GitHubIcon__svg from 'iconista/lib/react/fontawesome_brands/github';

const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <GitHubIcon__svg {...props} />;

export type Props = Record<string, never>;

export const Right: React.FC<Props> = () => {
  const [t] = useT();

  return (
    <div>
      <Popup
        renderContext={() => (
          <ContextPane right style={{minWidth: 260}}>
            <ContextSep />
            <ContextItem closePopup to={'https://github.com/streamich/json-joy/tree/master/packages/ui'}>
              <Split style={{alignItems: 'center'}}>
                <span>{t('GitHub repository')}</span>
                <GitHubIcon width={16} height={16} />
              </Split>
            </ContextItem>
            <ContextSep />
            <ContextSep line />
            <ContextSep />
            <ThemeContextItem />
            <ContextSep />
          </ContextPane>
        )}
      >
        <BasicButtonMore size={32} />
      </Popup>
    </div>
  );
};
