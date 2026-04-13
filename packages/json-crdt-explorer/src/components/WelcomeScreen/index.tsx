import * as React from 'react';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';

export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [t] = useT();

  return (
    <div style={{display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{width: '400px'}}>
        <Text
          as={'h6'}
          font="sans"
          style={{textAlign: 'center', margin: '16px 0 0', opacity: 0.55, lineHeight: '1.5em', fontSize: '15px'}}
        >
          JSON CRDT playground · Explore JSON CRDT documents state and patches · Save, load documents in various
          formats · Time travel and debug document internal state
        </Text>
        <NewFileForm expanded />
      </div>
    </div>
  );
};
