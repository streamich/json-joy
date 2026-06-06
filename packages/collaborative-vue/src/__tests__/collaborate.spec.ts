import {nextTick, watchEffect} from 'vue';
import {Model, s} from 'json-joy/lib/json-crdt';
import {collaborate} from '..';

interface Note {
  by: string;
  text: string;
  at: number;
}
interface Board {
  title: string;
  notes: Note[];
}

const newModel = () =>
  Model.create(
    s.obj({
      title: s.str('Untitled'),
      notes: s.arr<any>([]),
    }),
  ) as unknown as Model<any>;

describe('collaborate()', () => {
  test('reads mirror the document view', () => {
    const model = newModel();
    const {state, dispose} = collaborate<Board>(model);
    expect(state.title).toBe('Untitled');
    expect(state.notes.length).toBe(0);
    dispose();
  });

  test('plain assignment and array methods record CRDT ops', () => {
    const model = newModel();
    const {state, dispose} = collaborate<Board>(model);
    state.title = 'Hello';
    state.notes.push({by: 'a', text: 'first', at: 1});
    state.notes[0].text = 'edited';
    expect(model.view()).toEqual({title: 'Hello', notes: [{by: 'a', text: 'edited', at: 1}]});
    dispose();
  });

  test('is fine-grained: editing one field does not re-run unrelated effects', () => {
    const model = newModel();
    const {state, dispose} = collaborate<Board>(model);

    let titleRuns = 0;
    let notesRuns = 0;
    const stopTitle = watchEffect(
      () => {
        void state.title;
        titleRuns++;
      },
      {flush: 'sync'},
    );
    const stopNotes = watchEffect(
      () => {
        void state.notes.length;
        notesRuns++;
      },
      {flush: 'sync'},
    );
    expect(titleRuns).toBe(1);
    expect(notesRuns).toBe(1);

    state.title = 'Changed';
    expect(titleRuns).toBe(2);
    expect(notesRuns).toBe(1);

    state.notes.push({by: 'a', text: 'n', at: 1});
    expect(notesRuns).toBe(2);
    expect(titleRuns).toBe(2);

    stopTitle();
    stopNotes();
    dispose();
  });

  test('applies remote patches and re-renders the affected node', async () => {
    const local = newModel();
    local.api.flush();
    const remote = local.fork();

    const {state, dispose} = collaborate<Board>(local);
    let titleRuns = 0;
    const stop = watchEffect(
      () => {
        void state.title;
        titleRuns++;
      },
      {flush: 'sync'},
    );
    expect(titleRuns).toBe(1);

    remote.api.obj([]).set({title: 'From remote'});
    const patch = remote.api.flush();
    local.applyPatch(patch);
    await nextTick();

    expect(state.title).toBe('From remote');
    expect(titleRuns).toBe(2);

    stop();
    dispose();
  });

  test('dispose() stops reacting to further changes', () => {
    const model = newModel();
    const {state, dispose} = collaborate<Board>(model);
    let runs = 0;
    const stop = watchEffect(
      () => {
        void state.title;
        runs++;
      },
      {flush: 'sync'},
    );
    dispose();
    model.api.obj([]).set({title: 'after dispose'});
    expect(runs).toBe(1);
    stop();
  });
});
