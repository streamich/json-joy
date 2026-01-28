import * as React from 'react';
import {EditorView} from 'codemirror';
import {bind} from '@jsonjoy.com/collaborative-codemirror';
import {Model, s} from 'json-joy/lib/json-crdt';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';

const DESCRIPTION = `
This demo showcases synchronization of two CodeMirror Editor instances using
the \`CollaborativeCodemirror\` component from \`@jsonjoy.com/collaborative-codemirror\` package.

You can type in either editor, and the changes will be reflected in both editors
after synchronization. Use the top bar buttons to manually synchronize or adjust
auto-sync settings.
`;

export interface SbsCollabCodemirrorDemoProps {}

export const SbsCollabCodemirrorDemo: React.FC<SbsCollabCodemirrorDemoProps> = ({}) => {
  const model = React.useMemo(() => {
    const schema = s.str(`This is a collaborative CodeMirror Editor example.

You can edit the text here, and see changes
synchronized in real-time!
`);
    const model = Model.create(schema);
    return model;
  }, []);

  return (
    <DemoCard
      title={<Markdown inline src={'CodeMirror Editor'} />}
      subtitle={<Markdown inline src={'Collaborative CodeMirror v6 editor synchronization example'} />}
      description={<Markdown src={DESCRIPTION} />}
    >
      <SideBySideSync
        model={model}
        noDisplayHdr
        renderDisplay={(model) => <Editor model={model} />}
      />
    </DemoCard>
  );
};

interface EditorProps {
  model: Model<any>;
}

const Editor: React.FC<EditorProps> = ({model}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const div = ref.current;
    const editor = new EditorView({parent: div});
    const unbind = bind(() => model.s.$ as any, editor);
    return () => {
      unbind();
      editor.destroy();
    };
  }, [model]);

  return (
    <Paper style={{overflow: 'hidden', width: '100%'}} contrast>
      {/* <div className="Editor" ref={ref} style={{width: 800, minHeight: 250, border: '1px solid #ddd'}} /> */}
      <div ref={ref} style={{width: '100%', height: '200px', fontSize: '12px'}} />
    </Paper>
  );
};
