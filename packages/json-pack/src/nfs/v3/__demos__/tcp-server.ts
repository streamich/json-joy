import * as net from 'net';
import {RmRecordDecoder} from '../../../rm';
import {RpcMessageDecoder, RpcCallMessage} from '../../../rpc';
import {Nfsv3Decoder} from '../Nfsv3Decoder';

/* tslint:disable:no-console */

const PORT = Number(process.env.PORT) || 2049;
const HOST = '127.0.0.1';

const toHex = (buffer: Uint8Array | Buffer): string => {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const getProcName = (proc: number): string => {
  const names: Record<number, string> = {
    0: 'NULL',
    1: 'GETATTR',
    2: 'SETATTR',
    3: 'LOOKUP',
    4: 'ACCESS',
    5: 'READLINK',
    6: 'READ',
    7: 'WRITE',
    8: 'CREATE',
    9: 'MKDIR',
    10: 'SYMLINK',
    11: 'MKNOD',
    12: 'REMOVE',
    13: 'RMDIR',
    14: 'RENAME',
    15: 'LINK',
    16: 'READDIR',
    17: 'READDIRPLUS',
    18: 'FSSTAT',
    19: 'FSINFO',
    20: 'PATHCONF',
    21: 'COMMIT',
  };
  return names[proc] || `UNKNOWN(${proc})`;
};

const server = net.createServer((socket) => {
  console.log(`[${new Date().toISOString()}] Client connected from ${socket.remoteAddress}:${socket.remotePort}`);
  const rmDecoder = new RmRecordDecoder();
  const rpcDecoder = new RpcMessageDecoder();
  const nfsDecoder = new Nfsv3Decoder();
  socket.on('data', (data) => {
    console.log('\n' + '='.repeat(80));
    console.log(`[${new Date().toISOString()}] Received ${data.length} bytes`);
    console.log('HEX:', toHex(data));
    console.log('-'.repeat(80));
    const uint8Data = new Uint8Array(data);
    rmDecoder.push(uint8Data);
    let record = rmDecoder.readRecord();
    while (record) {
      console.log(`\nRPC Record (${record.size()} bytes):`);
      console.log('HEX:', toHex(record.subarray()));
      const rpcMessage = rpcDecoder.decodeMessage(record);
      if (rpcMessage) {
        console.log('\nRPC Message:');
        console.log(rpcMessage);
        if (rpcMessage instanceof RpcCallMessage) {
          const proc = rpcMessage.proc;
          console.log(`\nNFS Procedure: ${getProcName(proc)}`);
          if (rpcMessage.params) {
            const nfsMessage = nfsDecoder.decodeMessage(rpcMessage.params, proc, true);
            if (nfsMessage) {
              console.log('\nNFS Message:');
              console.log(nfsMessage);
            } else {
              console.log('Could not decode NFS message');
            }
          }
        }
      } else {
        console.log('Could not decode RPC message');
      }
      record = rmDecoder.readRecord();
    }
    console.log('='.repeat(80) + '\n');
  });
  socket.on('end', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected`);
  });
  socket.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Socket error:`, err.message);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`NFSv3 TCP Server listening on ${HOST}:${PORT}`);
  console.log('Waiting for connections...\n');
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
