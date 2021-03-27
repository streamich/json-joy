import {Document} from '../../document';


describe('string manipulation', () => {
  test('can edit strings', () => {
    const doc = new Document();
    const api = doc.api;
    api.root('')
      .commit()
      .strIns([], 0, 'var foo = bar')
      .commit()
      .strIns([], 10, '"')
      .commit()
      .strIns([], 14, '";')
      .commit()
      .strDel([], 0, 3)
      .commit()
      .strIns([], 0, 'const')
      .commit();
    expect(doc.toJson()).toBe('const foo = "bar";');
  });
  
  test('can edit strings - 2', () => {
    const doc = new Document();
    const api = doc.api;
    api.root({foo: [123, '', 5]})
      .commit()
      .strIns(['foo', 1], 0, 'var foo = bar')
      .commit()
      .strIns(['foo', 1], 10, '"')
      .commit()
      .strIns(['foo', 1], 14, '";')
      .commit()
      .strDel(['foo', 1], 0, 3)
      .commit()
      .strIns(['foo', 1], 0, 'const')
      .commit();
    expect(doc.toJson()).toEqual({
      foo: [123, 'const foo = "bar";', 5],
    });
  });
});

describe('patch()', () => {
  test('can patch multiple operations into a single patch', () => {
    const doc = new Document();
    const api = doc.api;
    api.root({foo: 'abc'}).commit();
    expect(api.patches.length).toBe(1);
    expect(doc.toJson()).toEqual({foo: 'abc'});
    api.patch(() => {
      api.strIns(['foo'], 1, '1');
      api.strIns(['foo'], 3, '2');
    });
    expect(api.patches.length).toBe(2);
    expect(doc.toJson()).toEqual({foo: 'a1bc2'});
  });
});
