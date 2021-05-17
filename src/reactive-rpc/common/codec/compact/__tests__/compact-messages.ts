import {
  CompactNotificationMessage,
  CompactRequestDataMessage,
  CompactRequestCompleteMessage,
  CompactRequestErrorMessage,
  CompactRequestUnsubscribeMessage,
  CompactResponseDataMessage,
  CompactResponseCompleteMessage,
  CompactResponseErrorMessage,
  CompactResponseUnsubscribeMessage,
} from '../types';

const notification1: CompactNotificationMessage = [''];
const notification2: CompactNotificationMessage = ['test'];
const notification3: CompactNotificationMessage = ['test', 123];
const notification4: CompactNotificationMessage = ['foo', {hello: 'world'}];

const reqData1: CompactRequestDataMessage = [1, 0, ''];
const reqData2: CompactRequestDataMessage = [2, 0, 'test'];
const reqData3: CompactRequestDataMessage = [3, 0, 'hello.world'];
const reqData4: CompactRequestDataMessage = [3, 0, 'ga.hello.world', {}];
const reqData5: CompactRequestDataMessage = [3, 0, 'ga.hello.world', { id: '123lasdjflaksjdf' }];

const reqComplete1: CompactRequestCompleteMessage = [1, 1, ''];
const reqComplete2: CompactRequestCompleteMessage = [1, 1, 'asdf'];
const reqComplete3: CompactRequestCompleteMessage = [1234, 1, 'a.b.c.c.d.a'];
const reqComplete4: CompactRequestCompleteMessage = [1234, 1, 'a.b.c.c.d.a', {}];
const reqComplete5: CompactRequestCompleteMessage = [1234, 1, 'a.b.c.c.d.a', []];
const reqComplete6: CompactRequestCompleteMessage = [12345, 1, 'a.b.c.c.d.a', {foo: {bar: 'test'}}];

const reqError1: CompactRequestErrorMessage = [1, 2, '', {}];
const reqError2: CompactRequestErrorMessage = [5, 2, '', {a: 'b'}];
const reqError3: CompactRequestErrorMessage = [15, 2, 'hmm', {a: [1,2,3]}];
const reqError4: CompactRequestErrorMessage = [55555, 2, '', {
  message: 'Some error happened',
  code: 'SOME_ERROR',
  errno: 94849,
}];

const reqUnsubscribe1: CompactRequestUnsubscribeMessage = [1, 3];
const reqUnsubscribe2: CompactRequestUnsubscribeMessage = [23423, 3];

const resData1: CompactResponseDataMessage = [0, 1, 'response'];
const resData2: CompactResponseDataMessage = [0, 123, {}];

const resComplete1: CompactResponseCompleteMessage = [-1, 1];
const resComplete2: CompactResponseCompleteMessage = [-1, 123];
const resComplete3: CompactResponseCompleteMessage = [-1, 4444, {}];
const resComplete4: CompactResponseCompleteMessage = [-1, 4444, [1, 2, 3, {foo: 'bar'}]];

const resError1: CompactResponseErrorMessage = [-2, 1, {}];
const resError2: CompactResponseErrorMessage = [-2, 123, {block: {id: 123}}];

const resUnsubscribe1: CompactResponseUnsubscribeMessage = [-3, 1];
const resUnsubscribe2: CompactResponseUnsubscribeMessage = [-3, 999];

export const compactMessages = {
  notification1,
  notification2,
  notification3,
  notification4,
  reqData1,
  reqData2,
  reqData3,
  reqData4,
  reqData5,
  reqComplete1,
  reqComplete2,
  reqComplete3,
  reqComplete4,
  reqComplete5,
  reqComplete6,
  reqError1,
  reqError2,
  reqError3,
  reqError4,
  reqUnsubscribe1,
  reqUnsubscribe2,
  resData1,
  resData2,
  resComplete1,
  resComplete2,
  resComplete3,
  resComplete4,
  resError1,
  resError2,
  resUnsubscribe1,
  resUnsubscribe2,
};
