import {s} from '../../json-crdt-patch';
import {Extension} from '../../json-crdt/extensions/Extension';
import {ExtNode} from '../../json-crdt/extensions/ExtNode';
import {ExtApi} from '../../json-crdt/extensions/types';
import * as ext from '../../json-crdt-extensions/ext';
import {NodeApi} from '../../json-crdt/model/api/nodes';
import {Model} from '../../json-crdt/model/Model';
import {ObjNode} from '../../json-crdt/nodes';

export type FileView = {type: 'File'; content: {type: 'Content'}};
class FileNode extends ExtNode<ObjNode, FileView> {
  public readonly extId = 101;

  public name(): string {
    return 'File' as const;
  }

  public view(): FileView {
    return {type: 'File', content: {type: 'Content'}};
  }
}
class FileApi extends NodeApi<FileNode> implements ExtApi<FileNode> {
  rename() {}
}
export const File = new Extension(101, 'File', FileNode, FileApi, () =>
  s.obj({type: s.con('File'), content: s.map({})}),
);

describe('Extensions', () => {
  test('type inference', () => {
    const schema = s.obj({
      field1: File.new(),
      field2: ext.cnt.new(1),
      field3: s.con('a'),
      field4: ext.mval.new(1),
    });
    const model = Model.create(schema, 1, {extensions: [File, ext.cnt, ext.mval]});
    const v = model.view();
    const f1 = model.api.node.get('field1');
    // now typed correctly
    type ModelView = typeof v;
    type NodeApi = typeof f1;
  });
});
