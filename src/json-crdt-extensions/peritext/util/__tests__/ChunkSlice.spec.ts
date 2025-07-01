import {s} from '../../../../json-crdt-patch';
import {Model} from '../../../../json-crdt/model';
import {ChunkSlice} from '../ChunkSlice';

const setup = () => {
  const model = Model.create().setSchema(s.str('Hello world'), false);
  const node = model.root.node();
  const chunk = node.first()!;
  return {
    model,
    node,
    chunk,
  };
};

describe('.id()', () => {
  it('slice ID is equal to chunk ID plus offset', () => {
    const {chunk} = setup();
    const slice = new ChunkSlice(chunk, 2, 2);
    expect(slice.id().sid).toBe(chunk.id.sid);
    expect(slice.id().time).toBe(chunk.id.time + 2);
  });
});

describe('.view()', () => {
  it('can create a one-char slice in a visible chunk', () => {
    const {chunk} = setup();
    const slice = new ChunkSlice(chunk, 0, 1);
    expect(slice.view()).toBe('H');
  });

  it('can create a two-char slice in a visible chunk', () => {
    const {chunk} = setup();
    const slice = new ChunkSlice(chunk, 0, 2);
    expect(slice.view()).toBe('He');
  });

  it('can create a three-char slice in a visible chunk in the middle', () => {
    const {chunk} = setup();
    const slice = new ChunkSlice(chunk, 3, 3);
    expect(slice.view()).toBe('lo ');
  });

  it('can create a four-char slice in a visible chunk at the end', () => {
    const {chunk} = setup();
    const slice = new ChunkSlice(chunk, 7, 4);
    expect(slice.view()).toBe('orld');
  });
});

describe('.refresh()', () => {
  it('hash changes depending on slice position', () => {
    const {chunk} = setup();
    const slice1 = new ChunkSlice(chunk, 0, 3);
    const slice2 = new ChunkSlice(chunk, 1, 3);
    const slice3 = new ChunkSlice(chunk, 2, 3);
    const hash1 = slice1.refresh();
    const hash2 = slice2.refresh();
    const hash3 = slice3.refresh();
    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash3).not.toBe(hash1);
  });

  it('hash is the same for the same position', () => {
    const {chunk} = setup();
    const slice1 = new ChunkSlice(chunk, 1, 6);
    const slice2 = new ChunkSlice(chunk, 1, 6);
    const hash1 = slice1.refresh();
    const hash2 = slice2.refresh();
    expect(hash1).toBe(hash2);
  });

  it('hash is different for different chunks', () => {
    const {chunk: chunk1} = setup();
    const {chunk: chunk2} = setup();
    const slice1 = new ChunkSlice(chunk1, 1, 6);
    const slice2 = new ChunkSlice(chunk2, 1, 6);
    const hash1 = slice1.refresh();
    const hash2 = slice2.refresh();
    expect(hash1).not.toBe(hash2);
  });
});
