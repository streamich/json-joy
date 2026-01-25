import * as React from 'react';
import {Popup} from 'nice-ui/lib/4-card/Popup';
import {ContextItem, ContextPane, ContextSep, ContextTitle} from 'nice-ui/lib/4-card/ContextMenu';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import * as demos from '../demos';
import {useT} from 'use-t';
import {CreateButton} from '../../molecules/CreateButton';
import {useDemos} from '../context';
import type {DemoDefinition} from '../types';

const icon = (demo: DemoDefinition) => {
  switch (demo.type) {
    case 'text':
      return <Iconista width={16} height={16} set="elastic" icon="vis_text" />;
    default:
      return null;
  }
};

export interface DemoSelectProps {
  width?: number;
}

export const DemoSelect: React.FC<DemoSelectProps> = ({width = 240}) => {
  const [t] = useT();
  const state = useDemos();
  const [loading, setLoading] = React.useState(false);

  return (
    <Popup
      block
      renderContext={() => (
        <ContextPane style={{width: width + 8}}>
          <ContextSep />
          <ContextTitle>{t('Plain text')}</ContextTitle>
          {demos.text.map((demo) => (
            <ContextItem
              closePopup
              key={demo.id}
              inset
              icon={icon(demo)}
              onClick={() => {
                setLoading(true);
                state.create(demo);
              }}
            >
              {demo.title}
            </ContextItem>
          ))}
          <ContextSep />
        </ContextPane>
      )}
    >
      <CreateButton primary block fill size={1} onClick={() => {}} loading={loading} disabled={loading}>
        Create document
      </CreateButton>
    </Popup>
  );
};
