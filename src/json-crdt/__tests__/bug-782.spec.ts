import {Patch, s} from '../../json-crdt-patch';
import {Model} from '../model';

test('initializing two users with schema, should merge changes correctly', () => {
  for (let i = 0; i < 22; i++) {
    const user1 = Model.create(
      s.obj({
        format: s.con('markdown'),
        text: s.str('Hello!'),
      }),
    );
    user1.api.flush();

    expect(user1.view()).toEqual({format: 'markdown', text: 'Hello!'});

    // Serialize the document and send it to another user
    const blob = user1.toBinary();

    // The other user loads the document and creates a "fork"
    // of it, so that a new session ID is assigned
    const user2 = Model.fromBinary(blob).fork();

    // Now both users insert concurrently some text at
    // the same position
    user1.api.str(['text']).ins(5, ' Alice');
    user2.api.str(['text']).ins(5, ' Charlie');

    // We now verify that documents of both users are different
    expect(user1.view()).toEqual({format: 'markdown', text: 'Hello Alice!'});
    expect(user2.view()).toEqual({format: 'markdown', text: 'Hello Charlie!'});

    // Users can now compute the patches of their changes
    const patch1 = user1.api.flush();
    const patch2 = user2.api.flush();

    // Users can exchange patches and apply them
    user1.applyPatch(Patch.fromBinary(patch2.toBinary()));
    user2.applyPatch(Patch.fromBinary(patch1.toBinary()));

    // Now both documents converge to the same state
    expect(user1.view()).toEqual(user2.view());
  }
});
