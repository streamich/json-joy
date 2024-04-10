import {Model} from '../../../json-crdt/model';
import {buildE2eClient} from '../../../reactive-rpc/common/testing/buildE2eClient';
import {createCaller} from '../../../server/routes/index';
import {RemoteHistoryDemoServer} from '../RemoteHistoryServer';

const setup = () => {
  const {caller, router} = createCaller();
  const {client} = buildE2eClient(caller);
  const remote = new RemoteHistoryDemoServer(client);

  return {
    caller,
    router,
    client,
    remote,
  };
};

test('...', async () => {
  const {remote} = await setup();
  const model = Model.withLogicalClock();
  model.api.root({foo: 'bar'});
  const patch = model.api.flush();
  
  await remote.create('1234567890', [patch]);
});
