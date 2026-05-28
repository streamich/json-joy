import * as React from 'react';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';
import {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {LiveCrdtRoom} from './LiveCrdtRoom';
import type {EditSession} from '@jsonjoy.com/json-crdt-repo/lib/session/EditSession';
import type {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';
import type {Model} from 'json-joy/lib/json-crdt';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const setup = (model: Model<any>) => {
  model.ext.register(ext.quill);
};

interface QuillRoomBodyProps {
  model: Model<any>;
  repo: JsonCrdtRepo;
  id: string;
  manager: PresenceManager;
}

const QuillRoomBody: React.FC<QuillRoomBodyProps> = ({model, repo, id, manager}) => {
  React.useEffect(() => {
    const client = repo.client;
    const room = id;
    const processId = manager.getProcessId();
    manager.onpush = (data) => {
      client.call('presence.update', {room, id: processId, data}).catch(() => {});
    };
    const sub = client.call$('presence.listen', {room}).subscribe((res: any) => {
      if (!res?.entries) return;
      for (const entry of res.entries) {
        if (entry.data) manager.receive(entry.data);
      }
    });
    manager.start();
    return () => {
      manager.stop();
      manager.onpush = undefined;
      sub.unsubscribe();
      client.call('presence.remove', {room, id: processId}).catch(() => {});
    };
  }, [repo, id, manager]);

  return (
    <Paper style={{overflow: 'hidden', width: '100%', marginTop: 16}} contrast>
      <div style={{width: '100%', height: 300}} onKeyDown={(e) => e.stopPropagation()}>
        <CollaborativeQuill
          style={{height: '300px'}}
          presence={manager}
          api={() => {
            model.ext.register(ext.quill);
            const s = (model as any).s;
            return typeof s?.toExt === 'function' ? s.toExt() : undefined;
          }}
        />
      </div>
    </Paper>
  );
};

const QuillRoom: React.FC<React.ComponentProps<typeof LiveCrdtRoom>> = (props) => {
  const [manager] = React.useState(() => {
    const m = new PresenceManager();
    m.setMeta({name: 'User ' + Math.random().toString(36).slice(2, 6)});
    return m;
  });
  return (
    <LiveCrdtRoom
      title="Live Collaborative Quill Editor"
      schema={ext.quill.new('Hello! Start typing here...')}
      setup={setup}
      {...props}
    >
      {(model: Model<any>, session: EditSession, repo) => {
        const id = String(session.id[1] ?? session.id[0] ?? '');
        return <QuillRoomBody model={model} repo={repo} id={id} manager={manager} />;
      }}
    </LiveCrdtRoom>
  );
};

const meta: Meta<typeof QuillRoom> = {
  component: QuillRoom,
  title: '<LiveCrdt>/<LiveCrdtRoom>',
};

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const WithInitialId: StoryObj<typeof meta> = {
  args: {
    initialId: 'live-crdt-room-demo',
  },
};
