import * as React from 'react';
import {createEditor, type Descendant, Editor} from 'slate';
import {Slate, Editable, withReact, type RenderLeafProps, type RenderElementProps} from 'slate-react';
import {bind, useSlatePresence, withPresenceLeaf} from '@jsonjoy.com/collaborative-slate';
import {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {LiveCrdt} from '../..';
import {DemoCard} from '../../../DemoCard';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import type {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';
import type {Model} from 'json-joy/lib/json-crdt';

const setup = (model: Model<any>) => {
  model.ext.register(ext.peritext);
};

const DESCRIPTION = `
A live collaborative Slate Editor connected to the public JSON CRDT server.
Open this page in two browser windows (or tabs) to see real-time collaboration
in action. The document is persisted in the browser's IndexedDB and synced to
the server, so edits work offline and merge automatically when reconnected.

Remote cursors are shown in real-time via the presence service.
`;

export interface LiveSlateDemoProps {
  /** Document ID. Defaults to \`'live-slate-demo'\`. */
  id?: string;
}

export const LiveSlateDemo: React.FC<LiveSlateDemoProps> = ({id = 'live-slate-demo'}) => {
  const [manager] = React.useState(() => {
    const m = new PresenceManager();
    m.setMeta({name: 'User ' + Math.random().toString(36).slice(2, 6)});
    return m;
  });

  return (
    <DemoCard
      title={<Markdown inline src="Live Collaborative Slate Editor" />}
      subtitle={<Markdown inline src={`Document ID: \`${id}\``} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <LiveCrdt id={id} schema={ext.peritext.new('Hello! Start typing here...')} setup={setup}>
        {(model: Model<any>, _session, repo) => (
          <LiveSlateDemoInner model={model} repo={repo} id={id} manager={manager} />
        )}
      </LiveCrdt>
    </DemoCard>
  );
};

// ------------------------------------------------------------------- Inner

interface LiveSlateDemoInnerProps {
  model: Model<any>;
  repo: JsonCrdtRepo;
  id: string;
  manager: PresenceManager;
}

const initialValue: Descendant[] = [{type: 'paragraph', children: [{text: ''}]} as any];

const LiveSlateDemoInner: React.FC<LiveSlateDemoInnerProps> = ({model, repo, id, manager}) => {
  const editor = React.useMemo(() => withReact(createEditor()), []);

  // Bind Slate ↔ CRDT.
  React.useEffect(() => {
    model.ext.register(ext.peritext);
    const peritextRef = () => (model as any).s.toExt();
    const unbind = bind(peritextRef, editor);
    return () => {
      unbind();
    };
  }, [model, editor]);

  // Presence networking: dumb pipe.
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

  // Presence rendering.
  const {decorate, sendLocalPresence} = useSlatePresence({
    manager,
    peritext: () => (model as any).s.toExt(),
    editor,
  });

  const renderLeaf = React.useMemo(
    () =>
      withPresenceLeaf(({attributes, children, leaf}: RenderLeafProps) => {
        let el = children;
        if ((leaf as any).bold) el = <strong>{el}</strong>;
        if ((leaf as any).italic) el = <em>{el}</em>;
        if ((leaf as any).underline) el = <u>{el}</u>;
        return <span {...attributes}>{el}</span>;
      }),
    [],
  );

  const renderElement = React.useCallback(({attributes, children, element}: RenderElementProps) => {
    switch ((element as any).type) {
      case 'heading': {
        const Tag = `h${(element as any).level || 1}` as 'h1' | 'h2' | 'h3';
        return <Tag {...attributes}>{children}</Tag>;
      }
      case 'blockquote':
        return (
          <blockquote {...attributes} style={{borderLeft: '4px solid #ccc', paddingLeft: '1rem', color: '#555'}}>
            {children}
          </blockquote>
        );
      default:
        return (
          <p {...attributes} style={{margin: '0 0 0.5rem 0', lineHeight: 1.6}}>
            {children}
          </p>
        );
    }
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;
      switch (event.key) {
        case 'b':
          event.preventDefault();
          toggleMark(editor, 'bold');
          break;
        case 'i':
          event.preventDefault();
          toggleMark(editor, 'italic');
          break;
        case 'u':
          event.preventDefault();
          toggleMark(editor, 'underline');
          break;
      }
    },
    [editor],
  );

  return (
    <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
      <div style={{width: '100%', height: 300}} onKeyDown={(e) => e.stopPropagation()}>
        <Slate
          editor={editor}
          initialValue={initialValue}
          onSelectionChange={sendLocalPresence}
          onChange={sendLocalPresence}
        >
          <Editable
            style={{padding: '16px 20px', minHeight: '280px', fontSize: '16px', lineHeight: 1.6, outline: 'none'}}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            decorate={decorate}
            onKeyDown={handleKeyDown}
            placeholder="Start typing..."
            spellCheck
          />
        </Slate>
      </div>
    </Paper>
  );
};

// ------------------------------------------------------------------- Helpers

const toggleMark = (editor: Editor, format: string): void => {
  const marks = Editor.marks(editor);
  const isActive = marks ? (marks as any)[format] === true : false;
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
