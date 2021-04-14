import {StringFuzzer} from './StringFuzzer';

test('...', () => {
  const fuzzer = new StringFuzzer();
  fuzzer.setupModel();
  const session = fuzzer.executeConcurrentSession();
  const json = session.models[0].toJson();
  for (let i = 1; i < session.models.length; i++) {
    expect(json).toEqual(session.models[i].toJson());
  }
});
