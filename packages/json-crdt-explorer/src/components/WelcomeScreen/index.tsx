import * as React from 'react';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';

export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [t] = useT();

  return (
    <div style={{display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column', padding: 16}}>
      <Paper round style={{width: '400px'}} contrast hoverElevate>
        <div style={{padding: '32px'}}>
          <Text
            as={'h6'}
            font="sans"
            style={{textAlign: 'center', margin: '0', opacity: 0.88, lineHeight: '1.5em', fontSize: '12px'}}
          >
            <strong>JSON CRDT playground</strong> · Explore JSON CRDT document state and history · Save & load documents in various
            formats · Time travel and debug document internal state
          </Text>
        </div>
        <Separator />
        <div style={{padding: '16px'}}>
          <NewFileForm expanded />
        </div>
      </Paper>
    </div>
  );
};
