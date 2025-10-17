import * as net from 'net';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {FullNfsv3Encoder} from '../FullNfsv3Encoder';
import {Nfsv3GetattrRequest} from '../messages';
import {Nfsv3Fh} from '../structs';
import {Nfsv3Proc} from '../constants';

/* tslint:disable:no-console */

const PORT = 2049;
const HOST = '127.0.0.1';

const createTestRequest = (): Nfsv3GetattrRequest => {
  const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  return new Nfsv3GetattrRequest(new Nfsv3Fh(fhData));
};

const createTestCred = () => {
  return {
    flavor: 0,
    body: new Reader(new Uint8Array()),
  };
};

const createTestVerf = () => {
  return {
    flavor: 0,
    body: new Reader(new Uint8Array()),
  };
};

console.log('Connecting to NFSv3 server...');

const client = net.connect({port: PORT, host: HOST}, () => {
  console.log(`Connected to ${HOST}:${PORT}`);
  console.log('Sending GETATTR request...\n');
  const encoder = new FullNfsv3Encoder();
  const request = createTestRequest();
  const xid = 12345;
  const proc = Nfsv3Proc.GETATTR;
  const cred = createTestCred();
  const verf = createTestVerf();
  const encoded = encoder.encodeCall(xid, proc, cred, verf, request);
  console.log(`Sending ${encoded.length} bytes`);
  console.log(
    'HEX:',
    Array.from(encoded)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' '),
  );
  client.write(encoded);
  setTimeout(() => {
    console.log('\nClosing connection...');
    client.end();
  }, 100);
});

client.on('data', (data) => {
  console.log('Received response:', data.length, 'bytes');
});

client.on('end', () => {
  console.log('Connection closed');
  process.exit(0);
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
