import {Model} from '../..';
import {s} from '../../../../json-crdt-patch';
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
  describe('.onSelfChange()', () => {
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

  describe('.onChildChange()', () => {
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

  describe('.onSubtreeChange()', () => {
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
  describe('.onSelfChange()', () => {
    test('emits "Remote" origin', async () => {
      const model = Model.create({foo: s.val(s.con(123))});
      const fork = model.fork();
      fork.s.foo.$.set(456);
      const patch = fork.api.flush();
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        expect(event.origin()).toBe(ChangeEventOrigin.Remote);
        expect(event.isLocal()).toBe(false);
      });
      model.applyPatch(patch);
    });

    test('lists edited node in `.direct()` list', async () => {
      const model = Model.create({
        foo: s.val(s.con(123)),
        bar: 'aga',
      });
      const fork = model.fork();
      fork.s.foo.$.set(456);
      const patch = fork.api.flush();
      let triggered = false;
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        expect(event.direct().has(model.s.foo.$.node)).toBe(true);
        triggered = true;
      });
      model.s.bar.$.onSelfChange((event: ChangeEvent) => {
        throw new Error('Should not be triggered');
      });
      model.applyPatch(patch);
      expect(triggered).toBe(true);
    });
  });

  describe('.onChildChange()', () => {
    test('fires callback on children change', async () => {
      const model = Model.create({
        side: '1',
        level1: {
          side: '2',
          level2: [
            s.val(s.con(123)),
            5,
          ]
        }
      });
      const fork = model.fork();
      fork.s.level1.level2[0].$.set(456);
      const triggered: string[] = [];
      model.s.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/');
      });
      model.s.side.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.level1.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1');
      });
      model.s.level1.side.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/side');
      });
      model.s.level1.level2.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2');
      });
      model.s.level1.level2[0].$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/0');
      });
      model.s.level1.level2[1].$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/1');
      });
      const patch = fork.api.flush();
      model.applyPatch(patch);
      expect(triggered).toEqual(['/', '/level1', '/level1/level2']);
    });
  });

  describe('.onSubtreeChange()', () => {
    test('fires callback on children and self change', async () => {
      const model = Model.create({
        side: '1',
        level1: {
          side: '2',
          level2: [
            s.val(s.con(123)),
            5,
          ]
        }
      });
      const fork = model.fork();
      fork.s.level1.level2[0].$.set(456);
      const triggered: string[] = [];
      model.s.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/');
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.level1.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1');
      });
      model.s.level1.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/side');
      });
      model.s.level1.level2.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2');
      });
      model.s.level1.level2[0].$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/0');
      });
      model.s.level1.level2[1].$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/1');
      });
      const patch = fork.api.flush();
      model.applyPatch(patch);
      expect(triggered).toEqual(['/', '/level1', '/level1/level2', '/level1/level2/0']);
    });
  });
});

describe('reset changes', () => {
  describe('.onSelfChange()', () => {
    test('emits "Reset" origin', async () => {
      const model = Model.create({foo: s.val(s.con(123))});
      const fork = model.fork();
      fork.s.foo.$.set(456);
      let origin: number = -123;
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        origin = event.origin();
        expect(event.origin()).toBe(ChangeEventOrigin.Reset);
        expect(event.isLocal()).toBe(false);
      }, true);
      model.reset(fork);
      expect(origin).toBe(ChangeEventOrigin.Reset);
    });

    test('lists edited node in `.direct()` list', async () => {
      const model = Model.create({
        foo: s.val(s.con(123)),
        bar: 'aga',
      });
      const fork = model.fork();
      fork.s.foo.$.set(456);
      let triggered = false;
      model.s.foo.$.onSelfChange((event: ChangeEvent) => {
        expect(event.direct().has(model.s.foo.$.node)).toBe(true);
        triggered = true;
      });
      model.s.bar.$.onSelfChange((event: ChangeEvent) => {
        throw new Error('Should not be triggered');
      });
      model.reset(fork);
      expect(triggered).toBe(true);
    });
  });

  describe('.onChildChange()', () => {
    test('fires callback on children change', async () => {
      const model = Model.create({
        side: '1',
        level1: {
          side: '2',
          level2: [
            s.val(s.con(123)),
            5,
          ]
        }
      });
      const fork = model.fork();
      fork.s.level1.level2[0].$.set(456);
      const triggered: string[] = [];
      model.s.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/');
      });
      model.s.side.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.level1.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1');
      });
      model.s.level1.side.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/side');
      });
      model.s.level1.level2.$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2');
      });
      model.s.level1.level2[0].$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/0');
      });
      model.s.level1.level2[1].$.onChildChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/1');
      });
      model.reset(fork);
      expect(triggered).toEqual(['/', '/level1', '/level1/level2']);
    });
  });

  describe('.onSubtreeChange()', () => {
    test('fires callback on children and self change', async () => {
      const model = Model.create({
        side: '1',
        level1: {
          side: '2',
          level2: [
            s.val(s.con(123)),
            5,
          ]
        }
      });
      const fork = model.fork();
      fork.s.level1.level2[0].$.set(456);
      const triggered: string[] = [];
      model.s.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/');
      });
      model.s.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/side');
      });
      model.s.level1.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1');
      });
      model.s.level1.side.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/side');
      });
      model.s.level1.level2.$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2');
      });
      model.s.level1.level2[0].$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/0');
      });
      model.s.level1.level2[1].$.onSubtreeChange((event: ChangeEvent) => {
        triggered.push('/level1/level2/1');
      });
      model.reset(fork);
      expect(triggered).toEqual(['/', '/level1', '/level1/level2', '/level1/level2/0']);
    });
  });
});
