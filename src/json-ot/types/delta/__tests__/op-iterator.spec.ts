import Delta from '../Delta';
import OpIterator from '../OpIterator';

describe('OpIterator', () => {
  const delta = new Delta()
    .insert('Hello', { bold: true })
    .retain(3)
    .insert({ embed: 2 }, { src: 'http://quilljs.com/' })
    .delete(4);

  it('hasNext() true', () => {
    const iter = new OpIterator(delta.ops);
    expect(iter.hasNext()).toEqual(true);
  });

  it('hasNext() false', () => {
    const iter = new OpIterator([]);
    expect(iter.hasNext()).toEqual(false);
  });

  it('peekLength() offset === 0', () => {
    const iter = new OpIterator(delta.ops);
    expect(iter.peekLength()).toEqual(5);
    iter.next();
    expect(iter.peekLength()).toEqual(3);
    iter.next();
    expect(iter.peekLength()).toEqual(1);
    iter.next();
    expect(iter.peekLength()).toEqual(4);
  });

  it('peekLength() offset > 0', () => {
    const iter = new OpIterator(delta.ops);
    iter.next(2);
    expect(iter.peekLength()).toEqual(5 - 2);
  });

  it('peekLength() no ops left', () => {
    const iter = new OpIterator([]);
    expect(iter.peekLength()).toEqual(Infinity);
  });

  it('peekType()', () => {
    const iter = new OpIterator(delta.ops);
    expect(iter.peekType()).toEqual('insert');
    iter.next();
    expect(iter.peekType()).toEqual('retain');
    iter.next();
    expect(iter.peekType()).toEqual('insert');
    iter.next();
    expect(iter.peekType()).toEqual('delete');
    iter.next();
    expect(iter.peekType()).toEqual('retain');
  });

  it('next()', () => {
    const iter = new OpIterator(delta.ops);
    for (let i = 0; i < delta.ops.length; i += 1) {
      expect(iter.next()).toEqual(delta.ops[i]);
    }
    expect(iter.next()).toEqual({ retain: Infinity });
    expect(iter.next(4)).toEqual({ retain: Infinity });
    expect(iter.next()).toEqual({ retain: Infinity });
  });

  it('next(length)', () => {
    const iter = new OpIterator(delta.ops);
    expect(iter.next(2)).toEqual({
      insert: 'He',
      attributes: { bold: true },
    });
    expect(iter.next(10)).toEqual({
      insert: 'llo',
      attributes: { bold: true },
    });
    expect(iter.next(1)).toEqual({ retain: 1 });
    expect(iter.next(2)).toEqual({ retain: 2 });
  });

  it('rest()', () => {
    const iter = new OpIterator(delta.ops);
    iter.next(2);
    expect(iter.rest()).toEqual([
      { insert: 'llo', attributes: { bold: true } },
      { retain: 3 },
      { insert: { embed: 2 }, attributes: { src: 'http://quilljs.com/' } },
      { delete: 4 },
    ]);
    iter.next(3);
    expect(iter.rest()).toEqual([
      { retain: 3 },
      { insert: { embed: 2 }, attributes: { src: 'http://quilljs.com/' } },
      { delete: 4 },
    ]);
    iter.next(3);
    iter.next(2);
    iter.next(4);
    expect(iter.rest()).toEqual([]);
  });
});
