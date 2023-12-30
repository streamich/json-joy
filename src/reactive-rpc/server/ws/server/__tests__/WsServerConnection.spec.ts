import * as stream from 'stream';
import {WsServerConnection} from '../WsServerConnection';
import {WsFrameEncoder} from '../../codec/WsFrameEncoder';
import {until} from 'thingies';

const setup = () => {
  const socket = new stream.PassThrough();
  const encoder = new WsFrameEncoder();
  const connection = new WsServerConnection(encoder, socket);
  return {socket, encoder, connection};
};

test('can parse PING frame', async () => {
  const {socket, encoder, connection} = setup();
  const pings: Uint8Array[] = [];
  connection.onping = (data: Uint8Array | null): void => {
    if (data) pings.push(data);
  };
  const pingFrame = encoder.encodePing(Buffer.from([0x01, 0x02, 0x03]));
  socket.write(pingFrame);
  await until(() => pings.length === 1);
  expect(pings[0]).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
});
