import Delta from '../../Delta';
import Op from '../../Op';

describe('invert()', () => {
  it('insert', () => {
    const delta = new Delta().retain(2).insert('A');
    const base = new Delta().insert('123456');
    const expected = new Delta().retain(2).delete(1);
    const inverted = delta.invert(base);
    expect(expected).toEqual(inverted);
    expect(base.compose(delta).compose(inverted)).toEqual(base);
  });

  it('delete', () => {
    const delta = new Delta().retain(2).delete(3);
    const base = new Delta().insert('123456');
    const expected = new Delta().retain(2).insert('345');
    const inverted = delta.invert(base);
    expect(expected).toEqual(inverted);
    expect(base.compose(delta).compose(inverted)).toEqual(base);
  });

  it('retain', () => {
    const delta = new Delta().retain(2).retain(3, { bold: true });
    const base = new Delta().insert('123456');
    const expected = new Delta().retain(2).retain(3, { bold: null });
    const inverted = delta.invert(base);
    expect(expected).toEqual(inverted);
    expect(base.compose(delta).compose(inverted)).toEqual(base);
  });

  it('retain on a delta with different attributes', () => {
    const base = new Delta().insert('123').insert('4', { bold: true });
    const delta = new Delta().retain(4, { italic: true });
    const expected = new Delta().retain(4, { italic: null });
    const inverted = delta.invert(base);
    expect(expected).toEqual(inverted);
    expect(base.compose(delta).compose(inverted)).toEqual(base);
  });

  it('combined', () => {
    const delta = new Delta()
      .retain(2)
      .delete(2)
      .insert('AB', { italic: true })
      .retain(2, { italic: null, bold: true })
      .retain(2, { color: 'red' })
      .delete(1);
    const base = new Delta()
      .insert('123', { bold: true })
      .insert('456', { italic: true })
      .insert('789', { color: 'red', bold: true });
    const expected = new Delta()
      .retain(2)
      .insert('3', { bold: true })
      .insert('4', { italic: true })
      .delete(2)
      .retain(2, { italic: true, bold: null })
      .retain(2)
      .insert('9', { color: 'red', bold: true });
    const inverted = delta.invert(base);
    expect(expected).toEqual(inverted);
    expect(base.compose(delta).compose(inverted)).toEqual(base);
  });

  describe('custom embed handler', () => {
    beforeEach(() => {
      Delta.registerEmbed<Op[]>('delta', {
        compose: (a, b) => new Delta(a).compose(new Delta(b)).ops,
        transform: (a, b, priority) =>
          new Delta(a).transform(new Delta(b), priority).ops,
        invert: (a, b) => new Delta(a).invert(new Delta(b)).ops,
      });
    });

    afterEach(() => {
      Delta.unregisterEmbed('delta');
    });

    it('invert a normal change', () => {
      const delta = new Delta().retain(1, { bold: true });
      const base = new Delta().insert({ delta: [{ insert: 'a' }] });

      const expected = new Delta().retain(1, { bold: null });
      const inverted = delta.invert(base);
      expect(expected).toEqual(inverted);
      expect(base.compose(delta).compose(inverted)).toEqual(base);
    });

    it('invert an embed change', () => {
      const delta = new Delta().retain({ delta: [{ insert: 'b' }] });
      const base = new Delta().insert({ delta: [{ insert: 'a' }] });

      const expected = new Delta().retain({
        delta: [{ delete: 1 }],
      });
      const inverted = delta.invert(base);
      expect(expected).toEqual(inverted);
      expect(base.compose(delta).compose(inverted)).toEqual(base);
    });

    it('invert an embed change with numbers', () => {
      const delta = new Delta()
        .retain(1)
        .retain(1, { bold: true })
        .retain({ delta: [{ insert: 'b' }] });
      const base = new Delta()
        .insert('\n\n')
        .insert({ delta: [{ insert: 'a' }] });

      const expected = new Delta()
        .retain(1)
        .retain(1, { bold: null })
        .retain({
          delta: [{ delete: 1 }],
        });
      const inverted = delta.invert(base);
      expect(expected).toEqual(inverted);
      expect(base.compose(delta).compose(inverted)).toEqual(base);
    });

    it('respects base attributes', () => {
      const delta = new Delta()
        .delete(1)
        .retain(1, { header: 2 })
        .retain({ delta: [{ insert: 'b' }] }, { padding: 10, margin: 0 });
      const base = new Delta()
        .insert('\n')
        .insert('\n', { header: 1 })
        .insert({ delta: [{ insert: 'a' }] }, { margin: 10 });

      const expected = new Delta()
        .insert('\n')
        .retain(1, { header: 1 })
        .retain(
          {
            delta: [{ delete: 1 }],
          },
          { padding: null, margin: 10 },
        );
      const inverted = delta.invert(base);
      expect(expected).toEqual(inverted);
      expect(base.compose(delta).compose(inverted)).toEqual(base);
    });

    it('works with multiple embeds', () => {
      const delta = new Delta()
        .retain(1)
        .retain({ delta: [{ delete: 1 }] })
        .retain({ delta: [{ delete: 1 }] });

      const base = new Delta()
        .insert('\n')
        .insert({ delta: [{ insert: 'a' }] })
        .insert({ delta: [{ insert: 'b' }] });

      const expected = new Delta()
        .retain(1)
        .retain({ delta: [{ insert: 'a' }] })
        .retain({ delta: [{ insert: 'b' }] });

      const inverted = delta.invert(base);
      expect(expected).toEqual(inverted);
      expect(base.compose(delta).compose(inverted)).toEqual(base);
    });

    it('invert a string', () => {
      const delta = new Delta().retain({ delta: [{ insert: 'a' }] });
      const base = new Delta().insert('a');

      expect(() => delta.invert(base)).toThrowError('cannot retain a string');
    });
  });
});
