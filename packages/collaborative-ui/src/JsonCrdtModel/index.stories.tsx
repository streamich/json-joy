import * as React from 'react';
import {JsonCrdtModel} from '.';
import {model0} from '../__tests__/fixtures';
import {Model, s} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '../CollaborativeInput';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';
import {useSelectNode} from '../hooks/useSelectNode';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';

export default {
  component: JsonCrdtModel,
  title: '<JsonCrdtModel>',
};

export const Default = {
  render: () => <JsonCrdtModel model={model0} />,
};

const model = Model.create(s.obj({text: s.str('hello')}));
type ModelWithText = typeof model;

const DemoDisplay: React.FC<{model: Model<any>}> = ({model}) => {
  const str = useSelectNode(model as ModelWithText, (s) => s.text.$);

  if (!str) return null;

  return <CollaborativeInput str={() => str} />;
};

export const WithDisplay = {
  render: () => <JsonCrdtModel renderDisplay={(model) => <DemoDisplay model={model} />} model={model} />,
};

const QuillDemo = () => {
  // biome-ignore lint: manual dependency list
  const model = React.useMemo(() => {
    const model = ModelWithExt.create(ModelWithExt.ext.quill.new(''));
    return model;
  }, ['']);

  return (
    <div>
      <div>
        {!!model && (
          <CollaborativeQuill
            api={() => model.s.toExt()}
            style={{
              width: '100%',
              height: '300px',
            }}
          />
        )}
      </div>
      <br />
      <JsonCrdtModel model={model} />
    </div>
  );
};

export const Quill = {
  render: () => <QuillDemo />,
};
