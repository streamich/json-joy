import {Model} from '../..';
import {ChangeEvent, ChangeEventOrigin} from '../events';

test('does not fire events after node is deleted', async () => {
  const model = Model.create();
  model.api.set({
    foo: {
      bar: {
        baz: 'asdf',
      },
    },
  });
  const bar = model.api.obj(['foo', 'bar']);
  let cnt = 0;
  bar.events.onViewChanges.listen(() => {
    cnt++;
  });
  expect(cnt).toBe(0);
  bar.set({
    gg: 'wp',
  });
  await Promise.resolve();
  expect(cnt).toBe(1);
  model.api.obj(['foo']).del(['bar']);
  model.api.obj(['foo']).set({gl: 'hf'});
  expect(cnt).toBe(1);
});

describe('local changes', () => {
  describe('self changes', () => {
    test('emits "Local" origin on local changes', async () => {
      const model = Model.create({foo: 'bar'});
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.foo.$.ins(3, '!');
    });

    test('lists edited node in `.direct()` list', async () => {
      const model = Model.create({foo: 'bar'});
      let triggered = false;
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        expect(event.direct().has(model.s.foo.$.node)).toBe(true);
        triggered = true;
      });
      model.s.foo.$.ins(3, '!');
      expect(triggered).toBe(true);
    });

    test('does not emit when other node edited', async () => {
      const model = Model.create({foo: 'bar', baz: 'qux'});
      let triggered = false;
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        triggered = true;
      });
      model.s.baz.$.ins(3, '!');
      expect(triggered).toBe(false);
    });

    test('triggers local change on merge (through ".applyLocalPatch()" path)', async () => {
      const model = Model.create({
        foo: 'bar',
        baz: 'qux',
      });
      const triggered: string[] = [];
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        triggered.push('foo');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.baz.$.onSelfChange((event: ChangeEvent) => {
        triggered.push('baz');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.foo.$.merge('Bar!!!');
      expect(triggered).toEqual(['foo']);
      expect(model.view()).toEqual({
        foo: 'Bar!!!',
        baz: 'qux',
      });
    });
  });

  describe('child changes', () => {
    test('emits "Local" origin and fires event only on parents', async () => {
      const model = Model.create({
        nested: {foo: 'bar', baz: 'qux'},
        side: 123,
      });
      const triggered: string[] = [];
      model.s.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.nested.foo.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/foo');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.baz.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/baz');
      });
      model.s.nested.foo.$.ins(3, '!');
      expect(triggered).toEqual(['/', '/nested']);
    });

    test('emits "Local" origin and fires event only on parents (on merge)', async () => {
      const model = Model.create({
        nested: {foo: 'bar', baz: 'qux'},
        side: 123,
      });
      const triggered: string[] = [];
      model.s.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.nested.foo.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/foo');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.baz.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/baz');
      });
      model.s.nested.foo.$.merge('barrr');
      expect(triggered).toEqual(['/', '/nested']);
    });
  });

  describe('subtree changes', () => {
    test('emits "Local" origin and fires event on whole subtree', async () => {
      const model = Model.create({
        nested: {foo: 'bar', baz: 'qux'},
        side: 123,
      });
      const triggered: string[] = [];
      model.s.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/nested');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.nested.foo.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/nested/foo');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.baz.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/baz');
      });
      model.s.nested.foo.$.ins(3, '!');
      expect(triggered).toEqual(['/', '/nested', '/nested/foo']);
    });

    test('emits "Local" origin and fires event on whole subtree (on merge)', async () => {
      const model = Model.create({
        nested: {foo: 'bar', baz: 'qux'},
        side: 123,
      });
      const triggered: string[] = [];
      model.s.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/nested');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.nested.foo.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/nested/foo');
        expect(event.origin()).toBe(ChangeEventOrigin.Local);
        expect(event.isLocal()).toBe(true);
      });
      model.s.nested.baz.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/nested/baz');
      });
      model.s.nested.foo.$.merge('barrr');
      expect(triggered).toEqual(['/', '/nested', '/nested/foo']);
    });
  });
});

describe('remote changes', () => {
  // TODO: ...
});

describe('reset changes', () => {
  // TODO: ...
});
