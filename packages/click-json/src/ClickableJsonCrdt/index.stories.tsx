import * as React from 'react';
import {ClickableJsonCrdt, ClickableJsonCrdtProps} from '.';
import {Model} from 'json-joy/lib/json-crdt';
import {s} from 'json-joy/lib/json-crdt-patch';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Text> = {
  title: 'ClickableJsonCrdt',
  component: ClickableJsonCrdt as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const Demo: React.FC<{view?: unknown; withExtensions?: boolean} & Omit<ClickableJsonCrdtProps, 'model'>> = ({
  view,
  withExtensions,
  ...rest
}) => {
  const model = React.useMemo(() => {
    const model = (withExtensions ? ModelWithExt : Model).create();
    if (view !== undefined) model.api.root(view);
    return model;
  }, []);
  React.useSyncExternalStore(model.api.subscribe, () => model.tick);

  return (
    <div style={{padding: '32px 64px', boxSizing: 'border-box'}}>
      <ClickableJsonCrdt {...rest} model={model} />
      <pre style={{fontSize: '10px'}}>
        <code>{model.root + ''}</code>
      </pre>
    </div>
  );
};

const schema1 = {
  foo: s.con([123, [null]]),
  bar: true,
  baz: {x: 1, val: s.val(s.con(true)), str: s.str('hello world')},
  emptyObject: {},
  qux: s.vec(s.con(1), s.con(-2), s.con('three'), s.con({four: 4})),
  arr: [s.con(0), 'hello world', -5, s.val(s.val(s.con(null))), s.val(s.con({foo: 'bar'}))],
  bin: s.bin(new Uint8Array([1, 2, 3, 4, 5])),
};

const doc2 = {
  id: 'pj7ryzaia1',
  model: 1.65555,
  cid: 'og6f0o9v1c',
  type: 'p',
  created: 1596445997247,
  modified: 1596445997381,
  pid: '92lmu7fs9a',
  depth: 0,
  mime: 'image/png',
  ext: 'png',
  file: 'image.png',
  w: 624,
  h: 1390,
  omark: [{x1: 0.027777777777777776, y1: 0.8438848920863309, x2: 0.25, y2: 0.8827338129496403}],
  isPost: true,
  isMature: false,
  parent: null,
  poster: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    name: 'Muhammad',
    list: [1, -5, true, false, null, 'asdf'],
  },
};

export const Primary: StoryObj<typeof meta> = {
  render: () => <Demo view={schema1} onFocus={(id) => console.log('onFocus', id)} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Readonly: StoryObj<typeof meta> = {
  render: () => <Demo view={schema1} readonly />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ShowRoot: StoryObj<typeof meta> = {
  render: () => <Demo view={schema1} showRoot />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const InteractiveLarge: StoryObj<typeof meta> = {
  render: () => <Demo view={doc2} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const EmptyDoc: StoryObj<typeof meta> = {
  render: () => <Demo />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ConstantRoot: StoryObj<typeof meta> = {
  render: () => <Demo view={s.con(123456789)} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ConstantRootJson: StoryObj<typeof meta> = {
  render: () => <Demo view={s.con({foo: [123, 'bar']})} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const LongValues: StoryObj<typeof meta> = {
  render: () => (
    <Demo
      view={{
        binaryData: s.bin(
          new Uint8Array([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
            141, 142, 143, 144, 145, 146, 255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241,
            240, 239, 238, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111,
            128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 128, 127, 126,
            125, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139,
            140, 141, 142, 143, 144, 145, 146, 255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242,
            241, 240, 239, 238, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112,
            111, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 128, 127,
            126, 125, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,
            139, 140, 141, 142, 143, 144, 145, 146, 255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243,
            242, 241, 240, 239, 238, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113,
            112, 111, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111, 128,
            127, 126, 125, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137,
            138, 139, 140, 141, 142, 143, 144, 145, 146, 255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244,
            243, 242, 241, 240, 239, 238, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114,
            113, 112, 111, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 111,
            128, 127, 126, 125,
          ]),
        ),
        longString:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. ' +
          'Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. ' +
          'Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ' +
          'ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. ' +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. ' +
          'Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat ' +
          'sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. ' +
          'Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar ' +
          'at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ' +
          'ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.',
      }}
    />
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const VectorNode: StoryObj<typeof meta> = {
  render: () => <Demo view={s.vec(s.con(123), s.str('abc'))} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const MultivalueRegisterExtension: StoryObj<typeof meta> = {
  render: () => <Demo view={s.obj({mval: ModelWithExt.ext.mval.new(123)})} withExtensions />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const PeritextExtension: StoryObj<typeof meta> = {
  render: () => (
    <Demo
      view={s.obj({
        extension: ModelWithExt.ext.peritext.new('text...'),
        vector: s.vec(s.con(123), s.con('abc'), s.con(null)),
      })}
      withExtensions
    />
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const QuillExtension: StoryObj<typeof meta> = {
  render: () => <Demo view={s.obj({quill: ModelWithExt.ext.quill.new('abc')})} withExtensions />,
  parameters: {
    layout: 'fullscreen',
  },
};

const ResetDemo: React.FC = () => {
  const [model1, model2] = React.useMemo(() => {
    const model = Model.create();
    return [model, model.clone()];
  }, []);

  return (
    <div style={{padding: '32px 64px', boxSizing: 'border-box'}}>
      <button
        onClick={() => {
          model1.reset(model2);
        }}
      >
        Reset
      </button>
      <br />
      <ClickableJsonCrdt model={model1} showRoot />
    </div>
  );
};

export const Reset: StoryObj<typeof meta> = {
  render: () => <ResetDemo />,
  parameters: {
    layout: 'fullscreen',
  },
};
