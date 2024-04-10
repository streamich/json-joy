import {Model} from '../../../json-crdt/model';
import {buildE2eClient} from '../../../reactive-rpc/common/testing/buildE2eClient';
import {createCaller} from '../../../server/routes/index';
import {RemoteHistoryDemoServer} from '../RemoteHistoryDemoServer';

const setup = () => {
  const {caller, router} = createCaller();
  const {client} = buildE2eClient(caller);
  const remote = new RemoteHistoryDemoServer(client);

  return {
    router,
    caller,
    client,
    remote,
  };
};

let cnt = 0;
const genId = () => Math.random().toString(36).slice(2) + '-' + Date.now().toString(36) + '-' + cnt++;

describe('.create()', () => {
  test('can create a block with a simple patch', async () => {
    const {remote, caller} = await setup();
    const model = Model.withLogicalClock();
    model.api.root({foo: 'bar'});
    const patch = model.api.flush();
    const blob = patch.toBinary();
    const id = genId();
    await remote.create(id, [{blob}]);
    const {data} = await caller.call('blocks.get', {id}, {});
    // console.log(data.patches);
    const model2 = Model.fromBinary(data.block.blob);
    expect(model2.view()).toEqual({foo: 'bar'});
  });
});
