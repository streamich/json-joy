import * as React from 'react';
import {ClickCard} from 'nice-ui/lib/4-card/ClickCard';
import {useDemos} from '../context';
import {useT} from 'use-t';
import {SideTextLayout} from '../SideTextLayout';
import * as demos from '../demos';
import {Text} from 'nice-ui/lib/1-inline/Text';

export type NewGridProps = Record<string, never>;

export const NewGrid: React.FC<NewGridProps> = () => {
  const [t] = useT();
  const state = useDemos();

  return (
    <SideTextLayout
      title={t('Create document')}
      left={
        <Text as={'p'} size={-2}>
          {t(
            'Click on a card to create a new live JSON CRDT document. You can then share the link with others to collaborate.',
          )}
        </Text>
      }
      right={
        <div style={{margin: '0 -16px'}}>
          <div style={{maxWidth: 456}}>
            <ClickCard title={'Blogpost'} to={''} onClick={() => state.create(demos.text[0])} toTitle={t('Create')}>
              {t('Edit a sample blog post form collaboratively.')}
            </ClickCard>
          </div>
        </div>
      }
    />
  );
};
