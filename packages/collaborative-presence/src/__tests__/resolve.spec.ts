import {s} from 'json-joy/lib/json-crdt-patch';
import {Model} from 'json-joy/lib/json-crdt';
import {PresenceManager} from '../PresenceManager';
import {ResolvedSelection} from '../ResolvedSelection';
import {toDto} from '../str';
import type {UserPresence, JsonCrdtSelection} from '../types';

/**
 * Build a peer's `UserPresence` tuple with a single str selection. The
 * selection is generated from a *sender-side* model — its anchor IDs come
 * from whatever characters the sender currently sees.
 */
const mkPresence = (processId: string, seq: number, selections: JsonCrdtSelection[]): UserPresence => [
  'user-' + processId,
  processId,
  seq,
  Date.now() / 1000,
  selections,
  {},
];

const setupSenderAndReceiver = (initial: string) => {
  const sender = Model.create().setSchema(s.obj({str: s.str(initial)}));
  // Receiver starts from the same schema patch so both have the str node at
  // identical IDs. Then patches diverge via applyBatch below.
  const receiver = Model.create().setSchema(s.obj({str: s.str(initial)}));
  return {sender, receiver};
};

describe('PresenceManager.resolve', () => {
  test('returns empty when there are no peers', () => {
    const pm = new PresenceManager();
    const {receiver} = setupSenderAndReceiver('hello');
    const out = pm.resolve('', receiver);
    expect(out.size).toBe(0);
  });

  test('promotes desired → displayed when anchor chars are already present', () => {
    const pm = new PresenceManager();
    const {sender, receiver} = setupSenderAndReceiver('hello');
    // Sender places a caret at offset 3 inside "hello".
    const dto = toDto(sender.s.str.$, [3]);
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    const slots = out.get('peer-1');
    expect(slots).toBeDefined();
    expect(slots!.length).toBe(1);
    const rs = slots![0];
    expect(rs).toBeInstanceOf(ResolvedSelection);
    expect(rs.desired).toBeNull();
    expect(rs.displayed).toBe(dto);
  });

  test('keeps desired pending when anchor chars have not arrived yet', () => {
    const pm = new PresenceManager();
    // Sender starts ahead — types "world" after the initial "hello"; receiver
    // never sees those chars.
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    sender.s.str.$.ins(5, ' world');
    // Caret at offset 9 — inside the un-propagated " world" chunk.
    const dto = toDto(sender.s.str.$, [9]);
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    const rs = out.get('peer-1')![0];
    expect(rs.desired).toBe(dto);
    expect(rs.displayed).toBeNull();
  });

  test('promotes pending desired on a later resolve() once the patches catch up', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    sender.s.str.$.ins(5, '!');
    const dto = toDto(sender.s.str.$, [6]);
    pm.receive(mkPresence('peer-1', 1, [dto]));
    // First resolve: receiver has not seen the '!' yet — pending.
    let out = pm.resolve('', receiver);
    expect(out.get('peer-1')![0].displayed).toBeNull();
    expect(out.get('peer-1')![0].desired).toBe(dto);
    // Sender's patches propagate to receiver.
    receiver.applyPatch(sender.api.flush());
    // Second resolve: anchor is now present → promote.
    out = pm.resolve('', receiver);
    expect(out.get('peer-1')![0].displayed).toBe(dto);
    expect(out.get('peer-1')![0].desired).toBeNull();
  });

  test('newer presence overwrites pending desired (LWW by seq)', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    sender.s.str.$.ins(5, 'A');
    const dtoA = toDto(sender.s.str.$, [6]);
    pm.receive(mkPresence('peer-1', 1, [dtoA]));
    pm.resolve('', receiver);
    sender.s.str.$.ins(6, 'B');
    const dtoB = toDto(sender.s.str.$, [7]);
    pm.receive(mkPresence('peer-1', 2, [dtoB]));
    const out = pm.resolve('', receiver);
    const rs = out.get('peer-1')![0];
    // The previous dtoA disappears: dtoB replaces desired, and both still
    // unresolvable because receiver hasn't applied any sender patches yet.
    expect(rs.desired).toBe(dtoB);
    expect(rs.displayed).toBeNull();
  });

  test('stale presence (lower seq) is ignored by PresenceManager.receive — resolver state untouched', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const dto2 = toDto(sender.s.str.$, [3]);
    pm.receive(mkPresence('peer-1', 5, [dto2]));
    pm.resolve('', receiver);
    const dto1 = toDto(sender.s.str.$, [1]);
    pm.receive(mkPresence('peer-1', 2, [dto1]));
    const out = pm.resolve('', receiver);
    expect(out.get('peer-1')![0].displayed).toBe(dto2);
  });

  test('previous displayed survives across resolves when newer desired is pending', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    // First selection — anchor exists on receiver, promotes to displayed.
    const dto1 = toDto(sender.s.str.$, [2]);
    pm.receive(mkPresence('peer-1', 1, [dto1]));
    pm.resolve('', receiver);
    sender.s.str.$.ins(5, '!!');
    const dto2 = toDto(sender.s.str.$, [7]);
    pm.receive(mkPresence('peer-1', 2, [dto2]));
    const out = pm.resolve('', receiver);
    const rs = out.get('peer-1')![0];
    // Renders the *old* displayed (last known good) while the newer
    // selection waits for its anchor chars.
    expect(rs.displayed).toBe(dto1);
    expect(rs.desired).toBe(dto2);
  });

  test('local peer is excluded from resolve output', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const localProcessId = pm.getProcessId();
    const dto = toDto(sender.s.str.$, [1]);
    pm.receive(mkPresence(localProcessId, 1, [dto]));
    const out = pm.resolve('', receiver);
    expect(out.has(localProcessId)).toBe(false);
  });

  test('selections in a different document are not resolved', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const dto = toDto(sender.s.str.$, [1]);
    // Reassign documentId to a non-default value.
    dto[0] = 'other-doc';
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    expect(out.size).toBe(0);
    const out2 = pm.resolve('other-doc', receiver);
    expect(out2.get('peer-1')).toBeDefined();
  });

  test('removes resolver state for peers no longer in the peers map', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const dto = toDto(sender.s.str.$, [1]);
    pm.receive(mkPresence('peer-1', 1, [dto]));
    pm.resolve('', receiver);
    pm.remove('peer-1');
    const out = pm.resolve('', receiver);
    expect(out.has('peer-1')).toBe(false);
    // Re-arrival creates a fresh slot — seq tracking reset.
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out2 = pm.resolve('', receiver);
    expect(out2.get('peer-1')![0].displayed).toBe(dto);
  });

  test('resolver state is cleared on destroy()', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const dto = toDto(sender.s.str.$, [1]);
    pm.receive(mkPresence('peer-1', 1, [dto]));
    pm.resolve('', receiver);
    pm.destroy();
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    expect(out.get('peer-1')![0].displayed).toBe(dto);
  });

  test('caret anchored to a deleted character still resolves (tombstone)', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    // Sender creates a presence pointing at offset 3 (after 'l').
    const dto = toDto(sender.s.str.$, [3]);
    // Now sender deletes that character. The CRDT keeps the tombstone.
    sender.s.str.$.del(2, 1);
    receiver.applyPatch(sender.api.flush());
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    // Anchor still resolves via findById against the tombstoned chunk.
    expect(out.get('peer-1')![0].displayed).toBe(dto);
  });

  test('range selection — both endpoints required for resolution', () => {
    const pm = new PresenceManager();
    const sender = Model.create().setSchema(s.obj({str: s.str('hello')}));
    const receiver = Model.create().setSchema(s.obj({str: s.str('hello')}));
    sender.s.str.$.ins(5, ' world');
    const dto = toDto(sender.s.str.$, [[3, 9]]); // crosses into un-propagated text
    pm.receive(mkPresence('peer-1', 1, [dto]));
    const out = pm.resolve('', receiver);
    // Focus anchor (in " world") not present → desired pending.
    expect(out.get('peer-1')![0].displayed).toBeNull();
    expect(out.get('peer-1')![0].desired).toBe(dto);
  });
});
