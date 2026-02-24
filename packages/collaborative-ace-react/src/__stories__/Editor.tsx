import * as React from 'react';
import {CollaborativeAce} from '..';
import type {Model as JsonCrdtModel} from 'json-joy/lib/json-crdt';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

export interface EditorProps {
  model: JsonCrdtModel<any>;
  presence?: PresenceManager;
}

export const Editor: React.FC<EditorProps> = ({model, presence}) => {
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', width: '100%', height: '200px'}}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <CollaborativeAce
        str={() => (model.s as any).$}
        width={'100%'}
        height={'200px'}
        style={{border: '1px solid #bbb', borderRadius: '4px', boxSizing: 'border-box'}}
        presence={presence}
        userFromMeta={(m: any) => m}
      />
    </div>
  );
};
