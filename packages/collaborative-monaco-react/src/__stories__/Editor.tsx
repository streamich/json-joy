import * as React from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import * as monaco from 'monaco-editor';
import {loader} from '@monaco-editor/react';
import {CollaborativeMonaco} from '..';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

loader.config({monaco});

export interface EditorProps {
  model: Model<any>;
  presence?: PresenceManager;
}

export const Editor: React.FC<EditorProps> = ({model, presence}) => {
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', width: '100%', height: '200px'}}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <CollaborativeMonaco
        width={'100%'}
        height={'200px'}
        str={() => (model.s as any).$}
        presence={presence}
        userFromMeta={(m: any) => m}
      />
    </div>
  );
};
