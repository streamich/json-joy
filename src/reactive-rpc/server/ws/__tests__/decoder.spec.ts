import {WebsocketDecoder} from "../WebsocketDecoder";

const {frame: WebSocketFrame} = require('websocket');

console.log(WebSocketFrame);

test('...', () => {
  const frame = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
  frame.mask = true;
  frame.binaryPayload = Buffer.from('hello');
  frame.opcode = 1;
  const buf = frame.toBuffer();
  const decoder = new WebsocketDecoder();
  decoder.push(buf);
  const header = decoder.readFrameHeader();
  console.log(buf, header);
});
