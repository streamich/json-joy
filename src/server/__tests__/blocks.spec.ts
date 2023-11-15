import {setup} from './setup';

describe('blocks', () => {
  test('can create an empty block', async () => {
    const {caller} = setup();
    const emits: any[] = [];
    await caller.call('blocks.create', {id: 'my-block', patches: []}, {});
    const {block} = (await caller.call('blocks.get', {id: 'my-block'}, {})).data;
    expect(block).toMatchObject({
      id: 'my-block',
      seq: 0,
      blob: expect.any(Uint8Array),
      created: expect.any(Number),
      updated: expect.any(Number),
    });
  });
});
