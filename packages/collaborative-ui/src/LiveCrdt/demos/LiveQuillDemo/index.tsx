import * as React from 'react';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';
import {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {LiveCrdt} from '../..';
import {DemoCard} from '../../../DemoCard';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import type {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';
import type {Model} from 'json-joy/lib/json-crdt';

const setup = (model: Model<any>) => {
  model.ext.register(ext.quill);
};

const DESCRIPTION = `
A live collaborative Quill Editor connected to the public JSON CRDT server.
Open this page in two browser windows (or tabs) to see real-time collaboration
in action. The document is persisted in the browser's IndexedDB and synced to
the server, so edits work offline and merge automatically when reconnected.

Remote cursors are shown in real-time via the presence service.
`;

export interface LiveQuillDemoProps {
  /** Document ID. Defaults to \`'live-quill-demo'\`. */
  id?: string;
}

export const LiveQuillDemo: React.FC<LiveQuillDemoProps> = ({id = 'live-quill-demo'}) => {
  const [manager] = React.useState(() => {
    const m = new PresenceManager();
    m.setMeta({name: 'User ' + Math.random().toString(36).slice(2, 6)});
    return m;
  });

  return (
    <DemoCard
      title={<Markdown inline src="Live Collaborative Quill Editor" />}
      subtitle={<Markdown inline src={`Document ID: \`${id}\``} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <LiveCrdt id={id} schema={ext.quill.new('Hello! Start typing here...')} setup={setup}>
        {(model: Model<any>, _session, repo) => (
          <LiveQuillDemoInner model={model} repo={repo} id={id} manager={manager} />
        )}
      </LiveCrdt>
    </DemoCard>
  );
};

interface LiveQuillDemoInnerProps {
  model: Model<any>;
  repo: JsonCrdtRepo;
  id: string;
  manager: PresenceManager;
}

const LiveQuillDemoInner: React.FC<LiveQuillDemoInnerProps> = ({model, repo, id, manager}) => {
  React.useEffect(() => {
    const client = repo.client;
    const room = id;
    const processId = manager.getProcessId();

    // Dumb pipe: manager pushes → send to server.
    manager.onpush = (data) => {
      client.call('presence.update', {room, id: processId, data}).catch(() => {});
    };

    // Dumb pipe: server pushes → feed into manager.
    const sub = client.call$('presence.listen', {room}).subscribe((res: any) => {
      if (!res?.entries) return;
      for (const entry of res.entries) {
        if (entry.data) manager.receive(entry.data);
      }
    });

    // Start heartbeat + GC timers.
    manager.start();

    return () => {
      manager.stop();
      manager.onpush = undefined;
      sub.unsubscribe();
      client.call('presence.remove', {room, id: processId}).catch(() => {});
    };
  }, [repo, id, manager]);

  return (
    <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
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
