import * as stream from 'stream';
import {WsServerConnection} from '../WsServerConnection';
import {WsFrameEncoder} from '../../codec/WsFrameEncoder';
import {until} from 'thingies';
import {WsFrameOpcode} from '../../codec';
import {bufferToUint8Array} from '@jsonjoy.com/util/lib/buffers/bufferToUint8Array';
import {listToUint8} from '@jsonjoy.com/util/lib/buffers/concat';

const setup = () => {
  const socket = new stream.PassThrough();
  const encoder = new WsFrameEncoder();
  const connection = new WsServerConnection(encoder, socket);
  return {socket, encoder, connection};
};

describe('.onping', () => {
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

  test('can parse empty PING frame', async () => {
    const {socket, encoder, connection} = setup();
    const pings: Uint8Array[] = [];
    connection.onping = (data: Uint8Array | null): void => {
      if (data) pings.push(data);
    };
    const pingFrame = encoder.encodePing(Buffer.from([0x01, 0x02, 0x03]));
    socket.write(pingFrame);
    const pingFrame2 = encoder.encodePing(Buffer.from([]));
    socket.write(pingFrame2);
    await until(() => pings.length === 2);
    expect(pings[0]).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
    expect(pings[1]).toEqual(new Uint8Array([]));
  });
});

describe('.onping', () => {
  test('can parse PONG frame', async () => {
    const {socket, encoder, connection} = setup();
    const pongs: Uint8Array[] = [];
    connection.onpong = (data: Uint8Array | null): void => {
      if (data) pongs.push(data);
    };
    const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
    socket.write(pingFrame);
    await until(() => pongs.length === 1);
    expect(pongs[0]).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
  });
});

describe('.onclose', () => {
  test('can parse CLOSE frame', async () => {
    const {socket, encoder, connection} = setup();
    const closes: [code: number, reason: string][] = [];
    connection.onclose = (code: number, reason: string): void => {
      closes.push([code, reason]);
    };
    const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
    socket.write(pingFrame);
    const closeFrame = encoder.encodeClose('OK', 1000);
    socket.write(closeFrame);
    await until(() => closes.length === 1);
    expect(closes[0]).toEqual([1000, 'OK']);
  });
});

describe('.onmessage', () => {
  describe('un-masked', () => {
    test('binary data frame', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const frame = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
      const payload = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(frame);
      socket.write(payload);
      await until(() => messages.length === 1);
      expect(messages[0]).toEqual([new Uint8Array([0x01, 0x02, 0x03]), false]);
    });

    test('two binary data frames', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const frame1 = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
      const payload1 = encoder.writer.flush();
      const frame2 = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x04, 0x05, 0x06]), 3);
      const payload2 = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(listToUint8([frame1, payload1, frame2, payload2]));
      await until(() => messages.length === 2);
      expect(messages[0]).toEqual([new Uint8Array([0x01, 0x02, 0x03]), false]);
      expect(messages[1]).toEqual([new Uint8Array([0x04, 0x05, 0x06]), false]);
    });

    test('errors when incoming message is too large', async () => {
      const {socket, encoder, connection} = setup();
      connection.maxIncomingMessage = 3;
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const closes: [code: number, reason: string][] = [];
      connection.onclose = (code: number, reason: string): void => {
        closes.push([code, reason]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const frame1 = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
      const payload1 = encoder.writer.flush();
      const frame2 = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 4, 0);
      encoder.writer.buf(Buffer.from([0x04, 0x05, 0x06, 0x07]), 4);
      const payload2 = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(listToUint8([frame1, payload1, frame2, payload2]));
      await until(() => messages.length === 1);
      await until(() => closes.length === 1);
      expect(messages[0]).toEqual([new Uint8Array([0x01, 0x02, 0x03]), false]);
      expect(closes[0]).toEqual([1009, 'TOO_LARGE']);
    });

    test('text frame', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame1 = encoder.encodePing(Buffer.from([0x01]));
      const pingFrame2 = encoder.encodePing(Buffer.from([0x01, 0x02, 0x03]));
      const closeFrame = encoder.encodeHdr(1, WsFrameOpcode.TEXT, 4, 0);
      encoder.writer.buf(Buffer.from('asdf'), 4);
      const payload = encoder.writer.flush();
      socket.write(pingFrame1);
      socket.write(pingFrame2);
      socket.write(closeFrame);
      socket.write(payload);
      await until(() => messages.length === 1);
      expect(messages[0]).toEqual([bufferToUint8Array(Buffer.from('asdf')), true]);
    });
  });

  describe('masked', () => {
    test('binary data frame', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const closeFrame = encoder.encodeHdr(1, WsFrameOpcode.BINARY, 3, 0x12345678);
      encoder.writeBufXor(Buffer.from([0x01, 0x02, 0x03]), 0x12345678);
      const payload = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(closeFrame);
      socket.write(payload);
      await until(() => messages.length === 1);
      expect(messages[0]).toEqual([new Uint8Array([0x01, 0x02, 0x03]), false]);
    });

    test('text frame', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame1 = encoder.encodePing(Buffer.from([0x01]));
      const pingFrame2 = encoder.encodePing(Buffer.from([0x01, 0x02, 0x03]));
      const closeFrame = encoder.encodeHdr(1, WsFrameOpcode.TEXT, 4, 0x12345678);
      encoder.writeBufXor(Buffer.from('asdf'), 0x12345678);
      const payload = encoder.writer.flush();
      socket.write(pingFrame1);
      socket.write(pingFrame2);
      socket.write(closeFrame);
      socket.write(payload);
      await until(() => messages.length === 1);
      expect(messages[0]).toEqual([bufferToUint8Array(Buffer.from('asdf')), true]);
    });
  });
});

describe('.onfragment', () => {
  test('parses out message fragments', async () => {
    const {socket, encoder, connection} = setup();
    const fragments: [isLast: boolean, data: Uint8Array, isUtf8: boolean][] = [];
    connection.onfragment = (isLast: boolean, data: Uint8Array, isUtf8: boolean): void => {
      fragments.push([isLast, data, isUtf8]);
    };
    const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
    const buf1 = encoder.encodeHdr(0, WsFrameOpcode.BINARY, 3, 0);
    encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
    const buf2 = encoder.writer.flush();
    const buf3 = encoder.encodeHdr(0, WsFrameOpcode.CONTINUE, 3, 0);
    encoder.writer.buf(Buffer.from([0x04, 0x05, 0x06]), 3);
    const buf4 = encoder.writer.flush();
    const buf5 = encoder.encodeHdr(1, WsFrameOpcode.CONTINUE, 3, 0);
    encoder.writer.buf(Buffer.from([0x07, 0x08, 0x09]), 3);
    const buf6 = encoder.writer.flush();
    socket.write(pingFrame);
    socket.write(buf1);
    socket.write(buf2);
    socket.write(buf3);
    socket.write(buf4);
    socket.write(buf5);
    socket.write(buf6);
    await until(() => fragments.length === 3);
    expect(fragments).toEqual([
      [false, new Uint8Array([0x01, 0x02, 0x03]), false],
      [false, new Uint8Array([0x04, 0x05, 0x06]), false],
      [true, new Uint8Array([0x07, 0x08, 0x09]), false],
    ]);
  });

  describe('when .onfragment is not defined', () => {
    test('emits an .onmessage with fully assembled message', async () => {
      const {socket, encoder, connection} = setup();
      const messages: [data: Uint8Array, isUtf8: boolean][] = [];
      connection.onmessage = (data: Uint8Array, isUtf8: boolean): void => {
        messages.push([data, isUtf8]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const buf1 = encoder.encodeHdr(0, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
      const buf2 = encoder.writer.flush();
      const buf3 = encoder.encodeHdr(0, WsFrameOpcode.CONTINUE, 3, 0);
      encoder.writer.buf(Buffer.from([0x04, 0x05, 0x06]), 3);
      const buf4 = encoder.writer.flush();
      const buf5 = encoder.encodeHdr(1, WsFrameOpcode.CONTINUE, 3, 0);
      encoder.writer.buf(Buffer.from([0x07, 0x08, 0x09]), 3);
      const buf6 = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(buf1);
      socket.write(buf2);
      socket.write(buf3);
      socket.write(buf4);
      socket.write(buf5);
      socket.write(buf6);
      await until(() => messages.length === 1);
      expect(messages).toEqual([[new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]), false]]);
    });

    test('errors out when incoming message is too large', async () => {
      const {socket, encoder, connection} = setup();
      connection.maxIncomingMessage = 8;
      const closes: [code: number, reason: string][] = [];
      connection.onclose = (code: number, reason: string): void => {
        closes.push([code, reason]);
      };
      const pingFrame = encoder.encodePong(Buffer.from([0x01, 0x02, 0x03]));
      const buf1 = encoder.encodeHdr(0, WsFrameOpcode.BINARY, 3, 0);
      encoder.writer.buf(Buffer.from([0x01, 0x02, 0x03]), 3);
      const buf2 = encoder.writer.flush();
      const buf3 = encoder.encodeHdr(0, WsFrameOpcode.CONTINUE, 3, 0);
      encoder.writer.buf(Buffer.from([0x04, 0x05, 0x06]), 3);
      const buf4 = encoder.writer.flush();
      const buf5 = encoder.encodeHdr(1, WsFrameOpcode.CONTINUE, 3, 0);
      encoder.writer.buf(Buffer.from([0x07, 0x08, 0x09]), 3);
      const buf6 = encoder.writer.flush();
      socket.write(pingFrame);
      socket.write(buf1);
      socket.write(buf2);
      socket.write(buf3);
      socket.write(buf4);
      socket.write(buf5);
      socket.write(buf6);
      await until(() => closes.length === 1);
      expect(closes).toEqual([[1009, 'TOO_LARGE']]);
    });
  });
});
