import {buildE2eClient} from '../../reactive-rpc/common/testing/buildE2eClient';
import {createCaller} from '../routes';
import {Services} from '../services/Services';

export const setup = () => {
  const services = new Services();
  const {caller} = createCaller(services);
  const {client} = buildE2eClient(caller, {
    writerDefaultBufferKb: [1, 32],
    clientBufferSize: [1, 3],
    clientBufferTime: [1, 10],
    serverBufferSize: [1, 3],
    serverBufferTime: [1, 10],
    requestLatency: [1, 10],
    responseLatency: [1, 10],
  });
  const call = client.call.bind(client);
  const call$ = client.call$.bind(client);
  return {services, caller, client, call, call$};
};
