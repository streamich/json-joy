import {s} from '../../../json-crdt-patch';
import * as ext from '../../../json-crdt-extensions/ext';
import {Model} from '../../model';
import type {JsonNodeToSchema, SchemaToJsonNode} from '../types';

describe('can infer schema of JSON CRDT nodes', () => {
  test('con', () => {
    const schema1 = s.con(123);
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('val', () => {
    const schema1 = s.val(s.con(true));
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('obj', () => {
    const schema1 = s.obj({
      hello: s.con('world'),
    });
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('vec', () => {
    const schema1 = s.vec(s.con(1), s.val(s.con(2)));
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('str', () => {
    const schema1 = s.str('asdf');
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('bin', () => {
    const schema1 = s.bin(new Uint8Array([1, 2, 3]));
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('arr', () => {
    const schema1 = s.arr([s.con(1), s.val(s.con(2))]);
    const schema2: JsonNodeToSchema<SchemaToJsonNode<typeof schema1>> = schema1;
  });

  test('ext: peritext', () => {
    const schema1 = s.obj({
      richText: ext.peritext.new('hello'),
    });
    type Nodes = SchemaToJsonNode<typeof schema1>;
    const schema2: JsonNodeToSchema<Nodes> = schema1;
  });

  test('from typed model', () => {
    const model = Model.create().setSchema(
      s.obj({
        id: s.con('asdf'),
        age: s.val(s.con(42)),
      }),
    );
    type Node = ReturnType<typeof model.root.node>;
    type Schema = JsonNodeToSchema<Node>;
    const schema: Schema = s.obj({
      id: s.con('asdf'),
      age: s.val(s.con(42)),
    });
  });
});
